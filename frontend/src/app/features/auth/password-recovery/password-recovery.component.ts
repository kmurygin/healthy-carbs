import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {TextInputComponent} from '../text-input/text-input.component';
import {ErrorMessageComponent} from '@shared/components/error-message/error-message.component';
import {PasswordRecoveryService} from "@core/services/password-recovery/password-recovery.service";
import {setErrorNotification} from "@shared/utils";
import {NotificationService} from "@core/services/ui/notification.service";
import type {ApiResponse} from "@core/models/api-response.model";
import {AuthHelperTextComponent} from "@features/auth/auth-helper-text/auth-helper-text.component";
import {AuthHeaderComponent} from "@features/auth/auth-header/auth-header.component";
import {getButtonClasses} from "@features/auth/auth.util";

@Component({
  selector: 'app-password-recovery',
  imports: [ReactiveFormsModule, TextInputComponent, ErrorMessageComponent, AuthHelperTextComponent, AuthHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
      <div class="max-w-md w-full space-y-8 p-8">

        <app-auth-header
          [headerText]="'Forgot your password?'"
          [headerSubText]="'Type your username to receive a one time password (OTP)'"
        />

        <form
          [formGroup]="form"
          (ngSubmit)="onSubmit()"
          class="mt-8 space-y-6"
        >
          <div class="grid grid-cols-1 gap-4">
            <app-text-input
              formControlName="username"
              id="username"
              label="Username"
              type="text"
            />
          </div>
          <button
            [disabled]="form.invalid || isSubmitting()"
            [class]="getButtonClasses()"
            type="submit"
          >
            @if (isSubmitting()) {
              Sending...
            } @else {
              Send code
            }
          </button>

          @if (errorMessage()) {
            <app-error-message [message]="errorMessage()"/>
          }
        </form>

        <app-auth-helper-text
          [infoText]="'Remember your password?'"
          [linkText]="'Back to signing in'"
          [linkUrl]="'/login'"
        />

      </div>
    </div>
  `
})
export class PasswordRecoveryComponent {
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');
  private formBuilder = inject(NonNullableFormBuilder);
  form = this.formBuilder.group({
    username: ['', Validators.required]
  });
  private passwordRecoveryService = inject(PasswordRecoveryService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  onSubmit() {
    if (this.form.invalid) return;

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const username: string = this.form.getRawValue().username;

    this.passwordRecoveryService.forgotPassword({username}).subscribe({
      next: (resp: ApiResponse<void>) => {
        this.notificationService.success(
          resp.message
          ?? "If an account with that username exists, an OTP code has been sent."
        )
        void this.router.navigate(['/verify-otp'], {state: {username}});
      },
      error: (err: unknown) => {
        setErrorNotification(
          this.notificationService, err, "Failed to send OTP. Please try again."
        );
        void this.router.navigate(['/login']);
        this.isSubmitting.set(false);
      }
    });
  }

  protected readonly getButtonClasses = getButtonClasses;
}
