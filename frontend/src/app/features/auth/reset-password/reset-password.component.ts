import {ChangeDetectionStrategy, Component, inject, type OnInit, signal} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {TextInputComponent} from '../text-input/text-input.component';
import {ErrorMessageComponent} from '@shared/components/error-message/error-message.component';
import {PasswordRecoveryService} from "@core/services/password-recovery/password-recovery.service";
import {NotificationService} from "@core/services/ui/notification.service";
import {setErrorNotification} from "@shared/utils";
import {passwordMatchValidator} from "@shared/validators/password-match.validator";
import type {ApiResponse} from "@core/models/api-response.model";
import type {ResetPasswordState} from "@features/auth/auth.util";

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, TextInputComponent, ErrorMessageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
      <div class="max-w-md w-full space-y-8 p-8">
        <div class="text-center">
          <h2 class="text-3xl font-extrabold text-emerald-900">
            Reset your password
          </h2>
        </div>

        <form
          [formGroup]="form"
          (ngSubmit)="onSubmit()"
          class="mt-8 space-y-6"
        >

          <div class="grid grid-cols-1 gap-4">
            <app-text-input
              formControlName="newPassword"
              id="newPassword"
              label="New password"
              type="password"
            />

            <div>
              <app-text-input
                formControlName="confirmPassword"
                id="confirmPassword"
                label="Confirm password"
                type="password"
              />
            </div>
          </div>

          <button
            type="submit"
            [disabled]="form.invalid || isSubmitting()"
            class="w-full flex justify-center py-2 px-4 border border-transparent text-sm
            font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700
            disabled:opacity-50 hover:cursor-pointer"
          >
            @if (isSubmitting()) {
              Resetting...
            } @else {
              Reset your password
            }
          </button>

          @if (errorMessage()) {
            <app-error-message [message]="errorMessage()"/>
          }
        </form>
      </div>
    </div>
  `
})
export class ResetPasswordComponent implements OnInit {
  username = '';
  otp = '';
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');

  private formBuilder = inject(NonNullableFormBuilder);

  form = this.formBuilder.group({
    newPassword: ['', [Validators.required, Validators.minLength(12)]],
    confirmPassword: ['', [Validators.required]]
    },
    {validators: passwordMatchValidator('newPassword', 'confirmPassword')}
  );

  private passwordRecoveryService = inject(PasswordRecoveryService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  ngOnInit() {
    const state = history.state as ResetPasswordState;
    if (!state.username || !state.otp) {
      void this.router.navigate(['/verify-otp']);
      return;
    }
    this.username = state.username;
    this.otp = state.otp;
  }

  onSubmit() {
    if (this.form.invalid || !this.username || !this.otp) return;

    this.isSubmitting.set(true);

    const payload = {
      username: this.username,
      otp: this.otp,
      newPassword: this.form.getRawValue().newPassword
    };

    this.passwordRecoveryService.resetPassword(payload).subscribe({
      next: (resp: ApiResponse<void>) => {
        void this.router.navigate(['/login']);
        this.notificationService.success(
          resp.message
          ?? "Your password has been reset."
        );
      },
      error: (err: unknown) => {
        setErrorNotification(
          this.notificationService, err, "Failed to reset password"
        );
        this.isSubmitting.set(false);
      }
    });
  }
}
