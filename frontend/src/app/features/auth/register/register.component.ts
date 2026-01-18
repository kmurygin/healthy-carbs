import {ChangeDetectionStrategy, Component, inject, signal, type WritableSignal} from '@angular/core';
import type {FormControl, FormGroup} from '@angular/forms';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '@core/services/auth/auth.service';
import type {RegisterPayload} from "@core/models/payloads/register.payload";
import {ErrorMessageComponent} from "@shared/components/error-message/error-message.component";
import type {FormFieldConfig} from "@shared/form-field.config";
import {TextInputComponent} from "@features/auth/text-input/text-input.component";
import {NotificationService} from "@core/services/ui/notification.service";
import {passwordMatchValidator} from "@shared/validators/password-match.validator";

type RegisterForm = FormGroup<{
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  username: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
}>;

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ErrorMessageComponent,
    TextInputComponent
  ],
  templateUrl: './register.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
  readonly errorMessage: WritableSignal<string> = signal('');
  readonly isSubmitting: WritableSignal<boolean> = signal(false);

  readonly registerFormFields: FormFieldConfig[] = [
    {
      key: 'firstName',
      label: 'First name',
      type: 'text',
      placeholder: 'First name',
      autocomplete: 'given-name',
      containerClass: 'col-span-1',
      autocapitalize: 'words'
    },
    {
      key: 'lastName',
      label: 'Last name',
      type: 'text',
      placeholder: 'Last name',
      autocomplete: 'family-name',
      containerClass: 'col-span-1',
      autocapitalize: 'words'
    },
    {
      key: 'username',
      label: 'Username',
      type: 'text',
      placeholder: 'Choose a username',
      autocomplete: 'username',
      containerClass: 'col-span-2',
      autocapitalize: 'none'
    },
    {
      key: 'email',
      label: 'Email address',
      type: 'email',
      placeholder: 'example@example.com',
      autocomplete: 'email',
      containerClass: 'col-span-2',
      autocapitalize: 'none'
    },
    {
      key: 'password',
      label: 'Password',
      type: 'password',
      placeholder: 'Create a password',
      autocomplete: 'new-password',
      containerClass: 'col-span-2',
      autocapitalize: 'none'
    },
    {
      key: 'confirmPassword',
      label: 'Confirm Password',
      type: 'password',
      placeholder: 'Confirm your password',
      autocomplete: 'new-password',
      containerClass: 'col-span-2',
      autocapitalize: 'none'
    }
  ];
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  readonly form: RegisterForm = this.formBuilder.group({
    firstName: this.formBuilder.control('', {validators: [Validators.required], nonNullable: true}),
    lastName: this.formBuilder.control('', {validators: [Validators.required], nonNullable: true}),
    username: this.formBuilder.control('', {validators: [Validators.required], nonNullable: true}),
    email: this.formBuilder.control('', {validators: [Validators.required, Validators.email], nonNullable: true}),
    password: this.formBuilder.control('', {validators: [Validators.required], nonNullable: true}),
    confirmPassword: this.formBuilder.control('', {validators: [Validators.required], nonNullable: true}),
  }, {
    validators: passwordMatchValidator('newPassword', 'confirmPassword')
  });
  private readonly notificationService = inject(NotificationService);

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const rawFormValues: RegisterPayload & { confirmPassword: string } = this.form.getRawValue();

    const registerPayload: RegisterPayload = {
      email: rawFormValues.email,
      username: rawFormValues.username,
      password: rawFormValues.password,
      firstName: rawFormValues.firstName,
      lastName: rawFormValues.lastName,
    };

    this.authService.register(registerPayload).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.notificationService.success('Successfully signed up.');
        if (response.status) {
          this.router.navigate(['login'])
            .catch((err: unknown) => {
              console.error('Navigation failed', err)
            });
        } else {
          this.errorMessage.set(response.message ?? 'Registration failed.');
        }
      },
      error: (err: unknown) => {
        this.isSubmitting.set(false);
        const msg = err instanceof Error
          ? err.message
          : 'Something went wrong.';
        this.errorMessage.set(msg);
      }
    });
  }
}
