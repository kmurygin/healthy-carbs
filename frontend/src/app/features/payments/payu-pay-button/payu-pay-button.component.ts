import {ChangeDetectionStrategy, Component, computed, inject, input, output, signal} from '@angular/core';
import {PayuService} from '../../../core/services/payu/payu.service';
import type {InitPaymentRequest} from '../dto/init-payment-request';
import {take} from 'rxjs';
import {saveLastLocalOrderId} from "../utils";
import type {Product} from "../dto/product";

@Component({
  selector: 'app-payu-pay-button',
  standalone: true,
  templateUrl: './payu-pay-button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PayuPayButtonComponent {
  localOrderId = input.required<string>();
  description = input('Healthy Carbs plan');
  totalAmount = input.required<number>();
  readonly totalAmountInt = computed(() => {
    const amount = this.totalAmount();
    return Number.isFinite(amount) ? Math.max(0, Math.round(amount)) : 0;
  });

  products = input.required<Product[]>();

  started = output<void>();
  readonly pending = signal(false);
  readonly error = signal<string | null>(null);
  readonly label = computed(() => (this.pending() ? 'Redirecting to PayU…' : 'Pay'));
  private readonly payuService = inject(PayuService);

  onPay(): void {
    this.pending.set(true);
    this.error.set(null);
    this.started.emit();

    const payload: InitPaymentRequest = {
      localOrderId: this.localOrderId(),
      description: this.description(),
      totalAmount: this.totalAmountInt(),
      products: this.products()
    };

    this.payuService.createPayment(payload).pipe(take(1)).subscribe({
      next: (response) => {
        saveLastLocalOrderId(payload.localOrderId);

        try {
          if (typeof window !== 'undefined') {
            window.location.assign(response?.data?.redirectUri ?? '');
            return;
          }
        } catch (e) {
          this.pending.set(false);
          console.error('Failed to redirect to PayU:', e);
          this.error.set('Failed to redirect to PayU. Please try again.');
        }
      },
      error: () => {
        this.pending.set(false);
        this.error.set('Failed to start PayU payment. Please try again.');
      }
    });
  }
}
