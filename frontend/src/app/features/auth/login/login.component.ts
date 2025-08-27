import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import type {FormGroup} from '@angular/forms';
import {FormBuilder, type FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthService} from '../../../core/services/auth.service';
import type {LoginPayload} from "../../../core/models/payloads/login.payload";

type LoginForm = FormGroup<{
  username: FormControl<string>;
  password: FormControl<string>;
}>;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  errorMessage = signal('');
  isSubmitting = signal(false);
  submitted = signal(false);

  private authService = inject(AuthService);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);

  readonly form: LoginForm = this.formBuilder.group({
    username: this.formBuilder.control<string>('', {validators: [Validators.required], nonNullable: true}),
    password: this.formBuilder.control<string>('', {validators: [Validators.required], nonNullable: true}),
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSubmitting.set(true);
    this.submitted.set(true);
    this.errorMessage.set('');

    this.form.get('username')?.setErrors(null);
    this.form.get('password')?.setErrors(null);

    const loginPayload: LoginPayload = this.form.getRawValue();

    this.authService.login(loginPayload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate([''])
          .catch(err => {
            console.error('Navigation failed', err);
          });
        window.location.reload();
      },
      error: (err: Error & { fieldErrors?: Record<string, string> }) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.message || 'An unexpected error occurred.');
      }
    });
  }
}
