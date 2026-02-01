import {FormControl, FormGroup} from '@angular/forms';
import {describe, expect, it} from 'vitest';

import {passwordMatchValidator} from './password-match.validator';

describe('passwordMatchValidator', () => {
  const createForm = (password: string, confirmPassword: string) => {
    return new FormGroup(
      {
        password: new FormControl(password),
        confirmPassword: new FormControl(confirmPassword),
      },
      {validators: passwordMatchValidator('password', 'confirmPassword')}
    );
  };

  it('passwordMatchValidator_whenPasswordsMatch_shouldReturnNull', () => {
    const form = createForm('secret123', 'secret123');
    expect(form.errors).toBeNull();
    expect(form.get('confirmPassword')?.hasError('mismatch')).toBe(false);
  });

  it('passwordMatchValidator_whenPasswordsDontMatch_shouldReturnMismatchError', () => {
    const form = createForm('secret123', 'different');
    expect(form.errors).toEqual({mismatch: true});
    expect(form.get('confirmPassword')?.hasError('mismatch')).toBe(true);
  });

  it('passwordMatchValidator_whenConfirmEmpty_shouldReturnNull', () => {
    const form = createForm('secret123', '');
    expect(form.errors).toBeNull();
  });

  it('passwordMatchValidator_whenPasswordsMatchAfterMismatch_shouldClearError', () => {
    const form = createForm('secret123', 'different');
    expect(form.get('confirmPassword')?.hasError('mismatch')).toBe(true);

    form.get('confirmPassword')?.setValue('secret123');
    form.updateValueAndValidity();
    expect(form.get('confirmPassword')?.hasError('mismatch')).toBe(false);
    expect(form.errors).toBeNull();
  });

  it('passwordMatchValidator_whenControlsMissing_shouldReturnNull', () => {
    const form = new FormGroup(
      {other: new FormControl('value')},
      {validators: passwordMatchValidator('password', 'confirmPassword')}
    );
    expect(form.errors).toBeNull();
  });

  it('passwordMatchValidator_whenConfirmHasOtherErrors_shouldPreserveOtherErrors', () => {
    const form = createForm('secret123', 'different');
    const confirmControl = form.get('confirmPassword')!;
    confirmControl.setErrors({...confirmControl.errors, minlength: true});

    confirmControl.setValue('secret123');
    form.updateValueAndValidity();

    expect(confirmControl.hasError('mismatch')).toBe(false);
  });
});
