import type {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

export function passwordMatchValidator(
  passwordControlName: string,
  confirmControlName: string
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get(passwordControlName);
    const confirmPassword = control.get(confirmControlName);

    if (!password || !confirmPassword) {
      return null;
    }

    if (confirmPassword.value && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({...confirmPassword.errors, mismatch: true});
      return {mismatch: true};
    }

    if (confirmPassword.hasError('mismatch')) {
      const errors = {...confirmPassword.errors};
      delete errors['mismatch'];
      confirmPassword.setErrors(Object.keys(errors).length > 0 ? errors : null);
    }

    return null;
  };
}
