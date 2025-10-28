import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import type {FormGroup} from '@angular/forms';
import {FormBuilder, type FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthService} from '../../../core/services/auth/auth.service';
import type {LoginPayload} from "../../../core/models/payloads/login.payload";
import {ErrorMessageComponent} from "../../../shared/components/error-message/error-message.component";

type LoginForm = FormGroup<{
  username: FormControl<string>;
  password: FormControl<string>;
}>;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ErrorMessageComponent,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  readonly errorMessage = signal('');
  readonly isSubmitting = signal(false);
  readonly submitted = signal(false);

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
          .catch((err: unknown) => {
            console.error('Navigation failed', err);
          });
        window.location.reload();
      },
      error: (err: unknown) => {
        this.isSubmitting.set(false);
        let msg = 'An unexpected error occurred.';
        if (err instanceof Error) {
          msg = err.message || msg;
        }
        this.errorMessage.set(msg);
      }
    });
  }
}
