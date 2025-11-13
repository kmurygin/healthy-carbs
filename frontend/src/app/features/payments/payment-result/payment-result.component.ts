import {ChangeDetectionStrategy, Component, computed, effect, inject, signal} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {DecimalPipe} from '@angular/common';
import type {Subscription} from 'rxjs';
import {switchMap, timer} from 'rxjs';
import {PayuService} from '@core/services/payu/payu.service';
import {PaymentStatus} from '../dto/payment-status.enum';
import {resolveLocalOrderId, safeRemoveLastLocalOrderId} from '../utils';
import type {Order} from '../dto/order';
import {ConfettiService} from "@core/services/confetti/confetti.service";
import type {ViewState} from "../payment-view.config";
import {statusToViewState, viewConfig} from "../payment-view.config";

@Component({
  selector: 'app-payment-result',
  imports: [
    RouterLink,
    DecimalPipe,
  ],
  templateUrl: './payment-result.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentResultComponent {
  readonly status = signal<PaymentStatus>(PaymentStatus.PENDING);
  readonly order = signal<Order | null>(null);
  readonly isTerminal = computed(() =>
    this.status() === PaymentStatus.COMPLETED ||
    this.status() === PaymentStatus.REJECTED ||
    this.status() === PaymentStatus.CANCELED
  );
  readonly paidAmount = computed(() => (this.order()?.totalAmount ?? 0) / 100);
  readonly viewData = computed(() => viewConfig[this.viewState()]);
  private readonly confettiService = inject(ConfettiService);
  private readonly payuService = inject(PayuService);
  private readonly route = inject(ActivatedRoute);
  private readonly localOrderId = signal<string | null>(resolveLocalOrderId(this.route));
  readonly viewState = computed<ViewState>(() => {
    if (!this.localOrderId()) return 'INVALID_ORDER';
    return statusToViewState[this.status()];
  });
  private readonly pollIntervalMs = 1500;

  constructor() {
    this.monitorPaymentStatus();
    this.triggerConfettiOnSuccess();
  }

  private monitorPaymentStatus(): void {
    effect((onCleanup) => {
      const localOrderId = this.localOrderId();
      const isTerminal = this.isTerminal();

      if (!localOrderId || isTerminal) {
        return;
      }

      const sub: Subscription = timer(0, this.pollIntervalMs)
        .pipe(
          switchMap(() => this.payuService.getOrderDetails(localOrderId))
        )
        .subscribe({
          next: (response) => {
            const nextStatus = response.paymentStatus;
            if (nextStatus !== PaymentStatus.PENDING) {
              this.status.set(nextStatus);
              this.order.set(response);
              safeRemoveLastLocalOrderId();
            }
          },
          error: (error: unknown) => {
            console.error('Error fetching order status:', error);
            this.status.set(PaymentStatus.REJECTED);
          },
        });

      onCleanup(() => {
        sub.unsubscribe();
      });
    });
  }

  private triggerConfettiOnSuccess(): void {
    let prevStatus: PaymentStatus | null = null;
    effect(() => {
      const current = this.status();
      if (prevStatus === PaymentStatus.PENDING && current === PaymentStatus.COMPLETED) {
        this.confettiService.triggerConfetti();
      }
      prevStatus = current;
    });
  }

}
