import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { TimeUtils } from '../../../core/utils/time.utils';

export class Customvalidators {
  /**
   * Validator for time format (HH:MM)
   * @returns Validator function
   */

  static timeFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const isValid = TimeUtils.isValidTimeFormat(control.value);
      return isValid ? null : { InvalidTimeFormat: true };
    };
  }

  /**
   * Validator for minimum number value
   * @param min - Minimum allowed value
   * @returns Validator function
   */
  static minValue(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const value = Number(control.value);
      return value >= min ? null : { minValue: { min, actual: value } };
    };
  }

  static employeeIdFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const employeeIdRegex = /^[A-Za-z0-9]{3,10}$/;
      const isValid = employeeIdRegex.test(control.value);
      return isValid ? null : { EmployeeIdFormat: true };
    };
  }

  static vehicleNumberFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const vehicleNumberRegex = /^[A-Za-z0-9\- ]{2,15}$/;
      const isValid = vehicleNumberRegex.test(control.value);
      return isValid ? null : { vehicleNumberFormat: true };
    };
  }
}
