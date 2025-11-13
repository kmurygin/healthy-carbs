import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {CommonModule, TitleCasePipe} from '@angular/common';
import type {PaymentStatus} from "@features/payments/dto/payment-status.enum";

type StatusStyles = Readonly<{
  style: string;
  icon: string;
}>;

const STATUS_STYLES: Record<PaymentStatus | 'DEFAULT', StatusStyles> = {
  COMPLETED: {
    style: 'bg-emerald-100 text-emerald-800',
    icon: 'fa-check-circle',
  },
  PENDING: {
    style: 'bg-blue-100 text-blue-800',
    icon: 'fa-spinner fa-spin',
  },
  REJECTED: {
    style: 'bg-rose-100 text-rose-800',
    icon: 'fa-ban',
  },
  CANCELED: {
    style: 'bg-orange-100 text-orange-800',
    icon: 'fa-circle-xmark',
  },
  DEFAULT: {
    style: 'bg-gray-100 text-gray-800',
    icon: 'fa-question-circle',
  },
};

@Component({
  selector: 'app-status-tag',
  imports: [CommonModule, TitleCasePipe],
  template: `
    @if (styles(); as s) {
      <span
        class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
        [class]="s.style"
      >
        <i class="fa-solid fa-xs" [class]="s.icon"></i>
        {{ status() | titlecase }}
      </span>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusTagComponent {
  readonly status = input.required<string>();

  readonly styles = computed<StatusStyles>(() => {
    const s = this.status() as PaymentStatus;
    return STATUS_STYLES[s];
  });
}
