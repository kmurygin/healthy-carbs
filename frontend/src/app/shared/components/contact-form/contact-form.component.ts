import {ChangeDetectionStrategy, Component, DestroyRef, inject, input, output, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {finalize} from 'rxjs';
import {ContactEmailService} from '@core/services/email/contact-email.service';
import {NotificationService} from '@core/services/ui/notification.service';
import type {UserDto} from '@core/models/dto/user.dto';
import {setErrorNotification} from '@shared/utils';

@Component({
  selector: 'app-contact-form',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm" role="dialog" (click)="onBackdrop($event)" (keydown.escape)="closed.emit()">
      <div class="flex min-h-full items-center justify-center p-4">
        <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-gray-200">
          <h3 class="text-xl font-bold text-gray-900 mb-1">
            Contact {{ recipient().firstName }} {{ recipient().lastName }}
          </h3>
          <p class="text-sm text-gray-500 mb-5">Send a message via email.</p>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4" novalidate>
            <div>
              <label for="subject" class="mb-1 block text-sm font-medium text-gray-700">Subject</label>
              <input
                id="subject"
                formControlName="subject"
                class="input"
                type="text"
              />
            </div>

            <div>
              <label for="message" class="mb-1 block text-sm font-medium text-gray-700">Message</label>
              <textarea
                id="message"
                formControlName="message"
                rows="5"
                maxlength="2000"
                class="input resize-none"
              ></textarea>
              <p class="text-xs text-gray-400 mt-1 text-right">
                {{ form.controls.message.value.length }}/2000
              </p>
            </div>

            <div class="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                (click)="closed.emit()"
                class="inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-2.5
                  text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300
                  hover:bg-gray-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="form.invalid || isSending()"
                class="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5
                  text-sm font-semibold text-white shadow-sm hover:bg-emerald-700
                  disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                @if (isSending()) {
                  Sending...
                } @else {
                  Send
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class ContactFormComponent {
  readonly recipient = input.required<UserDto>();
  readonly closed = output();
  readonly sent = output();

  readonly isSending = signal(false);
  private readonly fb = inject(FormBuilder);
  readonly form = this.fb.nonNullable.group({
    subject: ['', [Validators.required]],
    message: ['', [Validators.required, Validators.maxLength(2000)]],
  });
  private readonly contactEmailService = inject(ContactEmailService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const {subject, message} = this.form.getRawValue();
    this.isSending.set(true);

    this.contactEmailService
      .sendContactEmail(this.recipient().id, subject, message)
      .pipe(
        finalize(() => {
          this.isSending.set(false);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.notificationService.success('Message sent successfully.');
          this.sent.emit();
          this.closed.emit();
        },
        error: (error: unknown) => {
          setErrorNotification(this.notificationService, error, 'Failed to send message.');
        },
      });
  }

  onBackdrop(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closed.emit();
    }
  }
}
