import { Component, inject, OnInit } from '@angular/core';
import { RideService } from '../../service/ride.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { VehicleType } from '../../models/ride.model';
import { Router } from '@angular/router';
import { TimeUtils } from '../../../../core/utils/time.utils';
import { Customvalidators } from '../../validators/customvalidators';

@Component({
  selector: 'app-add-ride',
  imports: [ReactiveFormsModule],
  templateUrl: './add-ride.component.html',
  styleUrl: './add-ride.component.css',
  standalone: true,
})
export class AddRideComponent implements OnInit {
  rideForm!: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  currentDate = '';
  vehicleTypes = VehicleType;
  fb = inject(FormBuilder);
  rideService = inject(RideService);
  router = inject(Router);

  ngOnInit(): void {
    this.currentDate = TimeUtils.getCurrentDate();
    this.initializeForm();
  }

  /**
   * Initialize the reactive form with validators
   */
  private initializeForm(): void {
    this.rideForm = this.fb.group({
      employeeId: [
        '',
        [Validators.required, Customvalidators.employeeIdFormat()],
      ],
      vehicleType: ['', [Validators.required]],
      vehicleNo: [
        '',
        [Validators.required, Customvalidators.vehicleNumberFormat()],
      ],
      vacantSeats: ['', [Validators.required, Customvalidators.minValue(1)]],
      time: ['', [Validators.required, Customvalidators.timeFormat()]],
      pickupPoint: ['', [Validators.required, Validators.minLength(2)]],
      destination: ['', [Validators.required, Validators.minLength(2)]],
    });
  }

  /**
   * Check if a form field is invalid and touched
   * @param fieldName - Name of the form field
   * @returns True if field is invalid and has been touched
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.rideForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.rideForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.clearMessages();

    const formData = this.rideForm.value;

    this.rideService.addRide(formData).subscribe({
      next: (success) => {
        this.isSubmitting = false;
        if (success) {
          this.successMessage = 'Ride added successfully! Redirecting...';
          setTimeout(() => {
            this.router.navigate(['/available-rides']);
          }, 2000);
        } else {
          this.errorMessage =
            'Failed to add ride. You may already have a ride for today.';
        }
      },
      error: (error) => {
        console.error('Error adding ride:', error);
        this.isSubmitting = false;
        this.errorMessage =
          'An error occurred while adding the ride. Please try again.';
      },
    });
  }

  /**
   * Handle form cancellation
   */
  onCancel(): void {
    this.router.navigate(['/']);
  }

  /**
   * Mark all form fields as touched to trigger validation messages
   */
  private markAllFieldsAsTouched(): void {
    Object.keys(this.rideForm.controls).forEach((key) => {
      this.rideForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Clear success and error messages
   */
  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}
