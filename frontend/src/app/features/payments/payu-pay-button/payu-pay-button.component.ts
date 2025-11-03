import {ChangeDetectionStrategy, Component, computed, inject, input, output, signal} from '@angular/core';
import {PayuService} from '../../../core/services/payu/payu.service';
import type {InitPaymentRequest} from '../dto/init-payment-request';
import {take} from 'rxjs';
import {saveLastLocalOrderId} from "../utils";
import type {Product} from "../dto/product";
import {ErrorMessageComponent} from "../../../shared/components/error-message/error-message.component";

@Component({
  selector: 'app-payu-pay-button',
  templateUrl: './payu-pay-button.component.html',
  imports: [
    ErrorMessageComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PayuPayButtonComponent {
  readonly localOrderId = input.required<string>();
  readonly description = input('Healthy Carbs plan');
  readonly totalAmount = input.required<number>();
  readonly products = input.required<Product[]>();
  readonly externallyDisabled = input<boolean>(false);

  readonly paymentClicked = output();

  readonly isPending = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly totalAmountInt = computed(() => {
    const amount = this.totalAmount();
    return Number.isFinite(amount) ? Math.max(0, Math.round(amount)) : 0;
  });

  readonly payButtonClasses = computed(() => {
    const baseClasses = `
      flex w-full items-center justify-center rounded-lg px-5 py-3
      font-semibold shadow-md cursor-pointer
      text-white transition-all duration-200 ease-in-out
      disabled:opacity-60 disabled:cursor-not-allowed
      bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98]
    `;

    if (this.isPending() || this.externallyDisabled()) {
      return baseClasses + ' opacity-60';
    }

    return baseClasses;
  });

  private readonly payuService = inject(PayuService);

  onPay(): void {
    if (this.externallyDisabled() || this.isPending()) {
      return;
    }

    this.isPending.set(true);
    this.errorMessage.set(null);
    this.paymentClicked.emit();
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
            window.location.assign(response.redirectUri);
            return;
          }
        } catch (e: unknown) {
          let msg = 'Failed to redirect to PayU. Please try again.';
          if (e instanceof Error) {
            msg = e.message || msg;
          }
          this.isPending.set(false);
          this.errorMessage.set(msg);
        }
      },
      error: (e: unknown) => {
        let msg = 'Failed to start PayU payment. Please try again.';
        if (e instanceof Error) {
          msg = e.message || msg;
        }
        this.errorMessage.set(msg);
        this.isPending.set(false);
      }
    });
  }
}
