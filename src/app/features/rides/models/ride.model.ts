export interface Ride {
  id: string;
  employeeId: string;
  vehicleType: VehicleType;
  vehicleNo: string;
  vacantSeats: number;
  originalSeats: number;
  seatsCount: number;
  pickupPoint: string;
  destination: string;
  createdAt: Date;
  time: string;
  date: string;
  bookedEmployees: string[];
}

export enum VehicleType {
  CAR = 'Car',
  BIKE = 'Bike',
}

export interface RideBooking {
  rideId: string;
  employeeId: string;
  bookingTime: string;
}
