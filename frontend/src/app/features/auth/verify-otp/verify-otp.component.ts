import {ChangeDetectionStrategy, Component, inject, type OnInit, signal} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {TextInputComponent} from '../text-input/text-input.component';
import {ErrorMessageComponent} from '@shared/components/error-message/error-message.component';
import {PasswordRecoveryService} from "@core/services/password-recovery/password-recovery.service";
import {setErrorNotification} from "@shared/utils";
import {NotificationService} from "@core/services/ui/notification.service";
import type {ApiResponse} from "@core/models/api-response.model";
import type {ResetPasswordState} from "@features/auth/auth.util";

@Component({
  selector: 'app-verify-otp',
  imports: [ReactiveFormsModule, TextInputComponent, ErrorMessageComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
      <div class="max-w-md w-full space-y-8 p-8">
        <div class="text-center">
          <h2 class="text-3xl font-extrabold text-emerald-900">
            OTP Verification
          </h2>
          <p class="mt-2 text-sm text-gray-600">
            Enter your username and one-time password sent to your email address.
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
            <app-text-input
              formControlName="otp"
              id="otp"
              label="One-Time Password (OTP)"
              type="text"
            />
          </div>

          <button
            type="submit"
            [disabled]="form.invalid || isSubmitting()"
            class="w-full flex justify-center py-2 px-4 border border-transparent
            text-sm font-medium rounded-md text-white bg-emerald-600
            hover:bg-emerald-700 disabled:opacity-50 hover:cursor-pointer"
          >
            @if (isSubmitting()) {
              Verifying...
            } @else {
              Verify
            }
          </button>

          @if (errorMessage()) {
            <app-error-message [message]="errorMessage()"/>
          }
        </form>

        <div class="text-center">
          <a
            routerLink="/forgot-password"
            class="font-medium text-emerald-600 hover:text-emerald-500"
          >
            Send OTP again
          </a>
        </div>
      </div>
    </div>
  `
})
export class VerifyOtpComponent implements OnInit {
  readonly username = signal<string>('');
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');
  private formBuilder = inject(NonNullableFormBuilder);
  form = this.formBuilder.group({
    username: ['', Validators.required],
    otp: ['', [
      Validators.required,
      Validators.minLength(6)
    ]]
  });
  private passwordRecoveryService = inject(PasswordRecoveryService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  ngOnInit() {
    const state = history.state as ResetPasswordState;
    if (state.username) {
      this.username.set(state.username);
      this.form.controls.username.setValue(state.username);
      // this.form.controls.username.disable();
    }
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.isSubmitting.set(true);
    const submittedUsername = this.form.getRawValue().username;
    const otp = this.form.getRawValue().otp;

    this.passwordRecoveryService.verifyOtp({username: submittedUsername, otp}).subscribe({
      next: (resp: ApiResponse<void>) => {
        this.notificationService.success(
          resp.message
          ?? "OTP has been verified successfully."
        );
        void this.router.navigate(['/reset-password'], {
          state: {username: submittedUsername, otp}
        });
      },
      error: (err: unknown) => {
        setErrorNotification(
          this.notificationService, err, "Wrong OTP. Please try again."
        );
        this.isSubmitting.set(false);
      }
    });
  }
}
