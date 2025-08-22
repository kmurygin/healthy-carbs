import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {UserService} from '../../../core/services/user.service';

type ChangePasswordForm = FormGroup<{
  oldPassword: FormControl<string>;
  newPassword: FormControl<string>;
}>;

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangePasswordComponent {
  errorMessage = signal('');
  infoMessage = signal('');
  private readonly formBuilder = inject(FormBuilder);

  form: ChangePasswordForm = this.formBuilder.nonNullable.group({
    oldPassword: ['', Validators.required],
    newPassword: ['', Validators.required],
  });
  private readonly userService = inject(UserService);

  get formControl() {
    return this.form.controls;
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.errorMessage.set('');
    this.infoMessage.set('');

    this.userService.changePassword(this.form.getRawValue()).subscribe({
      next: (res) => {
        this.infoMessage.set(res?.message || 'Password updated successfully.');
        this.form.reset();
      },
      error: (err) => {
        const msg = err?.error?.message ?? err?.message ?? '';
        this.errorMessage.set(msg || 'Failed to change password. Please try again.');
      }
    });
  }
}
