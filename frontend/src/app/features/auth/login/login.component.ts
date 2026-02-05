import {ChangeDetectionStrategy, Component, DestroyRef, inject, signal} from '@angular/core';
import type {FormGroup} from '@angular/forms';
import {FormBuilder, type FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {AuthService} from '@core/services/auth/auth.service';
import type {LoginPayload} from "@core/models/payloads/login.payload";
import {ErrorMessageComponent} from "@shared/components/error-message/error-message.component";
import type {FormFieldConfig} from "@shared/form-field.config";
import {TextInputComponent} from "@features/auth/text-input/text-input.component";
import {NotificationService} from "@core/services/ui/notification.service";
import {AuthHelperTextComponent} from "@features/auth/auth-helper-text/auth-helper-text.component";
import {AuthHeaderComponent} from "@features/auth/auth-header/auth-header.component";
import {getButtonClasses} from "@features/auth/auth.util";

type LoginForm = FormGroup<{
  username: FormControl<string>;
  password: FormControl<string>;
}>;

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    ErrorMessageComponent,
    RouterLink,
    TextInputComponent,
    AuthHelperTextComponent,
    AuthHeaderComponent,
  ],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  readonly errorMessage = signal('');
  readonly isSubmitting = signal(false);
  readonly submitted = signal(false);
  readonly loginFormFields: FormFieldConfig[] = [
    {
      key: 'username',
      label: 'Username',
      type: 'text',
      placeholder: 'Enter your username',
      autocomplete: 'username',
      autocapitalize: 'none'
    },
    {
      key: 'password',
      label: 'Password',
      type: 'password',
      placeholder: 'Enter your password',
      autocomplete: 'current-password',
      autocapitalize: 'none'
    }
  ];
  protected readonly getButtonClasses = getButtonClasses;
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService: AuthService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly router: Router = inject(Router);
  private readonly formBuilder: FormBuilder = inject(FormBuilder);
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

    this.authService.login(loginPayload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.notificationService.success('Successfully signed in.');
        this.router.navigate([''])
          .catch((err: unknown) => {
            console.error('Navigation failed', err);
          });
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
