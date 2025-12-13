import {ChangeDetectionStrategy, Component, computed, effect, inject, signal} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {DecimalPipe} from '@angular/common';
import {finalize, pairwise, switchMap, takeWhile, tap, timer} from 'rxjs';
import {PayuService} from '@core/services/payu/payu.service';
import {PaymentStatus} from '../dto/payment-status.enum';
import {resolveLocalOrderId, safeRemoveLastLocalOrderId} from '../utils';
import type {Order} from '../dto/order';
import {ConfettiService} from "@core/services/confetti/confetti.service";
import type {ViewState} from "../payment-view.config";
import {statusToViewState, viewConfig} from "../payment-view.config";
import {takeUntilDestroyed, toObservable} from "@angular/core/rxjs-interop";
import {filter} from "rxjs/operators";

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
      const orderId = this.localOrderId();

      if (!orderId) return;

      const sub = timer(0, this.pollIntervalMs)
        .pipe(
          switchMap(() => this.payuService.getOrderDetails(orderId)),
          takeWhile(response => response.paymentStatus === PaymentStatus.PENDING, true),
          tap({
            next: (response) => {
              this.status.set(response.paymentStatus);
              this.order.set(response);
            },
            error: (err: unknown) => {
              console.error('Error fetching order status:', err);
              this.status.set(PaymentStatus.REJECTED);
            }
          }),
          finalize(() => {
            if (this.status() !== PaymentStatus.PENDING) {
              safeRemoveLastLocalOrderId();
            }
          })
        )
        .subscribe();

      onCleanup(() => {
        sub.unsubscribe()
      });
    });
  }

  private triggerConfettiOnSuccess(): void {
    toObservable(this.status)
      .pipe(
        pairwise(),
        filter(([prev, curr]) => prev === PaymentStatus.PENDING && curr === PaymentStatus.COMPLETED),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        this.confettiService.triggerConfetti();
      });
  }
}
