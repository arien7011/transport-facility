import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Ride, RideBooking, VehicleType } from '../models/ride.model';
import { StorageService } from '../../../core/services/storage.service';
import { TimeUtils } from '../../../core/utils/time.utils';

@Injectable({
  providedIn: 'root',
})
export class RideService {
  private readonly RIDES_KEY = 'transportRides';
  private readonly BOOKINGS_KEY = 'transportBooking';

  private ridesSubject = new BehaviorSubject<Ride[]>([]);
  private bookingsSubject = new BehaviorSubject<RideBooking[]>([]);

  private rides$ = this.ridesSubject.asObservable();
  private bookings$ = this.bookingsSubject.asObservable();
  localStorage = inject(StorageService);
  constructor() {
    this.loadRides();
  }

  private loadRides(): void {
    const rides = this.localStorage.getItem<Ride[]>(this.RIDES_KEY) || [];
    const bookings =
      this.localStorage.getItem<RideBooking[]>(this.BOOKINGS_KEY) || [];

    const currentDate = TimeUtils.getCurrentDate();
    const currentDayRides = rides.filter(
      (ride: Ride) => ride.date === currentDate
    );

    this.ridesSubject.next(currentDayRides);
    this.bookingsSubject.next(bookings);
  }

  /**
   * Save rides to localStorage
   */
  private saveRides() {
    this.localStorage.setItem(this.RIDES_KEY, this.ridesSubject.getValue());
  }

  /**
   * Save bookings to localStorage
   */
  private saveBooking() {
    this.localStorage.setItem(
      this.BOOKINGS_KEY,
      this.bookingsSubject.getValue()
    );
  }

  private generateRideId(): string {
    return `$ride_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  public addRide(
    rideData: Omit<Ride, 'id' | 'date' | 'bookedEmployees' | 'originalSeats'>
  ): Observable<boolean> {
    return new Observable((observer) => {
      try {
        const existingRide = this.ridesSubject.value.find(
          (ride) => ride.employeeId === rideData.employeeId
        );

        if (existingRide) {
          observer.next(false);
          observer.complete();
          return;
        }

        const newRide: Ride = {
          ...rideData,
          date: TimeUtils.getCurrentDate(),
          bookedEmployees: [],
          id: this.generateRideId(),
          originalSeats: rideData.vacantSeats,
        };
        const currentData = this.ridesSubject.value;
        const updatedData = [...currentData, newRide];
        this.ridesSubject.next(updatedData);
        this.saveRides();
        observer.next(true);
        observer.complete();
      } catch (error) {
        observer.next(false);
        observer.complete();
        console.log(`Error while adding to LocalStorage : ${error}`);
      }
    });
  }

  bookRide(rideId: string, employeeId: string): Observable<boolean> {
    return new Observable((observer) => {
      try {
        const rides = this.ridesSubject.getValue();
        const rideIndex = rides.findIndex((ride: Ride) => ride.id === rideId);

        if (rideIndex === -1) {
          observer.next(false);
          observer.complete();
          return;
        }

        const rideData: Ride = rides[rideIndex];

        if (rideData.employeeId === employeeId) {
          observer.next(false); //Employee cannot book their own ride
          observer.complete();
          return;
        }

        if (rideData.vacantSeats <= 0) {
          observer.next(false);
          observer.complete();
          return;
        }

        if (rideData.bookedEmployees.includes(employeeId)) {
          observer.next(false); // Employee cannot book the same ride twice
          observer.complete();
          return;
        }

        const updatedRideData = {
          ...rideData,
          vaccantseats: rideData.vacantSeats - 1,
          bookedEmployees: [...rideData.bookedEmployees, employeeId],
        };

        const updatedRidesData = [...rides];
        updatedRidesData[rideIndex] = updatedRideData;

        const booking: RideBooking = {
          employeeId: employeeId,
          rideId: rideId,
          bookingTime: TimeUtils.getCurrentDate(),
        };
        const currentBookings = this.bookingsSubject.getValue();
        const updateBookings = [...currentBookings, booking];

        this.ridesSubject.next(updatedRidesData);
        this.bookingsSubject.next(updateBookings);

        this.saveRides();
        this.saveBooking();

        observer.next(true);
        observer.complete();
      } catch (error) {
        console.log(`Error while saving booking data ${error}`);
      }
    });
  }

  availableRides(filters: {
    vehicleType?: VehicleType;
    timeInString?: string;
    employeeId?: string;
  }): Observable<Ride[]> {
    return this.rides$.pipe(
      map((rides: Ride[]) => {
        const filteredRides = rides.filter(
          (ride: Ride) => ride.vacantSeats > 0
        );

        // Apply vehicle type filter
        if (filters?.vehicleType) {
          filteredRides.filter(
            (ride: Ride) => ride.vehicleType === filters.vehicleType
          );
        }

        // Apply time buffer filter (±60 minutes)
        if (filters.timeInString) {
          filteredRides.filter((ride: Ride) =>
            TimeUtils.isTimeInBuffer(ride.time, filters.timeInString!, 60)
          );
        }

        // Exclude rides created by the same employee (if employeeId provided)
        //excluse employees whos employee id exist in the rides if provided.
        if (filters.employeeId) {
          filteredRides.filter(
            (ride: Ride) => ride.employeeId !== filters.employeeId
          );
        }

        return filteredRides;
      })
    );
  }

  /**
   * Get rides created by a specific employee
   * @param employeeId - Employee ID
   * @returns Observable<Ride[]> - Rides created by employee
   */
  getRidesByEmployee(employeeId: string): Observable<Ride[]> {
    return this.rides$.pipe(
      map((rides) => rides.filter((ride) => ride.employeeId === employeeId))
    );
  }

  /**
   * Get bookings made by a specific employee
   * @param employeeId - Employee ID
   * @returns Observable<RideBooking[]> - Bookings made by employee
   */

  getBookingsByEmployee(employeeId: string): Observable<RideBooking[]> {
    return this.bookings$.pipe(
      map((bookings) =>
        bookings.filter((booking) => booking.employeeId === employeeId)
      )
    );
  }

  /**
   * Check if an employee can book a specific ride
   * @param rideId - Ride ID
   * @param employeeId - Employee ID
   * @returns boolean - True if can book
   */

  canBookRide(rideId: string, employeeId: string): boolean {
    const rides = this.ridesSubject.getValue();
    const ride = rides.find((ride: Ride) => ride.id === rideId);

    if (!ride) return false;
    if (ride.vacantSeats <= 0) return false;
    if (ride.employeeId === employeeId) return false;
    if (ride.bookedEmployees.includes(employeeId)) return false;

    return true;
  }
}
