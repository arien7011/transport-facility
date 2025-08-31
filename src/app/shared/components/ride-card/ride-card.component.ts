import { Component, inject, input, OnInit, output } from '@angular/core';
import { Ride, VehicleType } from '../../../features/rides/models/ride.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ride-card',
  imports: [],
  templateUrl: './ride-card.component.html',
  styleUrl: './ride-card.component.css',
  standalone: true,
})
export class RideCardComponent implements OnInit {
  ride = input<Ride>();
  vehicleTypes = VehicleType;
  canBook = input<boolean>(true);
  showBookButton = input<boolean>(false);
  router = inject(Router);
  bookRide = output<string>();

  ngOnInit(): void {
    console.log({ canbook: this.canBook() });
  }

  onBookRide(rideId: string) {
    if (this.canBook()) {
      this.bookRide.emit(rideId);
    }
  }
}
