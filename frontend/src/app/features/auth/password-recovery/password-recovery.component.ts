import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {TextInputComponent} from '../text-input/text-input.component';
import {ErrorMessageComponent} from '@shared/components/error-message/error-message.component';
import {PasswordRecoveryService} from "@core/services/password-recovery/password-recovery.service";
import {setErrorNotification} from "@shared/utils";
import {NotificationService} from "@core/services/ui/notification.service";
import type {ApiResponse} from "@core/models/api-response.model";

@Component({
  selector: 'app-password-recovery',
  imports: [ReactiveFormsModule, RouterLink, TextInputComponent, ErrorMessageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
      <div class="max-w-md w-full space-y-8 p-8">
        <div class="text-center">
          <h2 class="text-3xl font-extrabold text-emerald-900">
            Forgot your password?
          </h2>
          <p class="mt-2 text-sm text-gray-600">
            Type your username to receive a one time password (OTP)
          </p>
        </div>

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
            type="submit"
            [disabled]="form.invalid || isSubmitting()"
            class="w-full flex justify-center py-2 px-4 border border-transparent text-sm
            font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700
            disabled:opacity-50 hover:cursor-pointer"
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

        <div class="text-center">
          <a
            routerLink="/login"
            class="font-medium text-emerald-600 hover:text-emerald-500"
          >
            Back to signing in
          </a>
        </div>
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
}
