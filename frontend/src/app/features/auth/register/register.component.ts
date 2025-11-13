import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import type {FormControl, FormGroup} from '@angular/forms';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '@core/services/auth/auth.service';

import type {RegisterPayload} from "@core/models/payloads/register.payload";
import {NgOptimizedImage} from "@angular/common";
import {ErrorMessageComponent} from "@shared/components/error-message/error-message.component";

type RegisterForm = FormGroup<{
  firstname: FormControl<string>;
  lastname: FormControl<string>;
  username: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
}>;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    NgOptimizedImage,
    ErrorMessageComponent
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
  readonly errorMessage = signal('');
  readonly isSubmitting = signal(false);

  private authService = inject(AuthService);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);


  readonly form: RegisterForm = this.formBuilder.group({
    firstname: this.formBuilder.control('', {validators: [Validators.required], nonNullable: true}),
    lastname: this.formBuilder.control('', {validators: [Validators.required], nonNullable: true}),
    username: this.formBuilder.control('', {validators: [Validators.required], nonNullable: true}),
    email: this.formBuilder.control('', {validators: [Validators.required, Validators.email], nonNullable: true}),
    password: this.formBuilder.control('', {validators: [Validators.required], nonNullable: true}),
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const registerPayload: RegisterPayload = this.form.getRawValue();

    this.authService.register(registerPayload).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);

        if (response.status) {
          this.router.navigate(['login'])
            .catch((err: unknown) => {
              console.error('Navigation failed', err);
            });
        } else {
          this.errorMessage.set(response.message ?? 'Registration failed.');
        }
      },
      error: (err: unknown) => {
        this.isSubmitting.set(false);
        let msg = 'Something went wrong. Please try again.';
        if (err instanceof Error) {
          msg = err.message || msg;
        }
        this.errorMessage.set(msg);
      }
    });
  }
}
