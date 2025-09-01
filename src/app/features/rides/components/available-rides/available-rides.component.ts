import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { Subject, takeUntil, startWith, debounceTime } from 'rxjs';
import { RideCardComponent } from '../../../../shared/components/ride-card/ride-card.component';
import { Ride, VehicleType } from '../../models/ride.model';
import { RideService } from '../../service/ride.service';
import { TimeUtils } from '../../../../core/utils/time.utils';

@Component({
  selector: 'app-available-rides',
  imports: [CommonModule, ReactiveFormsModule, RideCardComponent],
  templateUrl: './available-rides.component.html',
  styleUrl: './available-rides.component.css',
  standalone: true,
})
export class AvailableRidesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  filtersForm!: FormGroup;
  filteredRides: Ride[] = [];
  currentEmployeeId = '';
  currentDate = '';
  lastUpdated: Date | null = null;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  vehicleTypes = VehicleType;

  rideService = inject(RideService);
  fb = inject(NonNullableFormBuilder);
  employeeIdControl = this.fb.control('');

  ngOnInit(): void {
    this.currentDate = TimeUtils.getCurrentDate();
    this.initializeForms();
    this.setupSubscriptions();
    this.loadRides();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize reactive forms
   */
  private initializeForms(): void {
    this.filtersForm = this.fb.group({
      vehicleType: [''],
      searchTime: [''],
    });
  }

  /**
   * Set up reactive subscriptions for filters and employee ID
   */
  private setupSubscriptions(): void {
    // Watch employee ID changes
    this.employeeIdControl.valueChanges
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((employeeId) => {
        this.currentEmployeeId = employeeId?.trim() || '';
        this.clearMessages();
        if (this.currentEmployeeId) {
          this.loadRides();
        } else {
          this.filteredRides = [];
        }
      });

    // Watch filter changes
    this.filtersForm.valueChanges
      .pipe(
        startWith(this.filtersForm.value),
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (this.currentEmployeeId) {
          this.loadRides();
        }
      });
  }

  /**
   * Load and filter available rides
   */
  private loadRides(): void {
    if (!this.currentEmployeeId) return;

    this.isLoading = true;

    const filters = {
      ...this.filtersForm.value,
      employeeId: this.currentEmployeeId,
    };

    // Remove empty filter values
    Object.keys(filters).forEach((key) => {
      if (!filters[key]) {
        delete filters[key];
      }
    });

    this.rideService
      .availableRides(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (rides) => {
          if (!rides) return;
          this.filteredRides = rides;
          this.lastUpdated = new Date();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading rides:', error);
          this.errorMessage =
            'Failed to load available rides. Please try again.';
          this.isLoading = false;
        },
      });
  }

  /**
   * Handle ride booking
   * @param rideId - ID of the ride to book
   */
  onBookRide(rideId: string): void {
    if (!this.currentEmployeeId) {
      this.errorMessage = 'Please enter your Employee ID first.';
      return;
    }

    this.clearMessages();

    this.rideService.bookRide(rideId, this.currentEmployeeId).subscribe({
      next: (success) => {
        if (success) {
          this.successMessage = 'Ride booked successfully!';
          // Refresh rides to show updated seat count
          this.loadRides();
          // Clear success message after 3 seconds
          setTimeout(() => (this.successMessage = ''), 3000);
        } else {
          this.errorMessage =
            'Failed to book ride. It may be full or you may have already booked it.';
        }
      },
      error: (error) => {
        console.error('Error booking ride:', error);
        this.errorMessage =
          'An error occurred while booking the ride. Please try again.';
      },
    });
  }

  /**
   * Check if current employee can book a specific ride
   * @param ride - Ride to check
   * @returns True if can book
   */
  canBookRide(ride: Ride): boolean {
    if (!this.currentEmployeeId) return false;
    return this.rideService.canBookRide(ride.id, this.currentEmployeeId);
  }

  /**
   * Clear filter values
   */
  clearFilters(): void {
    this.filtersForm.reset({
      vehicleType: '',
      searchTime: '',
    });
  }

  /**
   * Clear success and error messages
   */
  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  /**
   * TrackBy function for ride list performance
   * @param index - List index
   * @param ride - Ride item
   * @returns Unique identifier for tracking
   */
  trackByRideId(index: number, ride: Ride): string {
    return ride.id;
  }
}
