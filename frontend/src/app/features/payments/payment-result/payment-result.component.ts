import {ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, signal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {switchMap, timer} from 'rxjs';
import type {Subscription} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {PayuService} from '../../../core/services/payu/payu.service';
import {PaymentStatus} from '../dto/payment-status';
import {resolveLocalOrderId, safeRemoveLastLocalOrderId} from '../utils';
import type {Order} from "../dto/order";
import {ErrorMessageComponent} from "../../../shared/components/error-message/error-message.component";
import {SuccessMessageComponent} from "../../../shared/components/success-message/success-message.component";
import {InfoMessageComponent} from "../../../shared/components/info-message/info-message.component";

@Component({
  selector: 'app-payment-result',
  imports: [
    ErrorMessageComponent,
    SuccessMessageComponent,
    InfoMessageComponent
  ],
  templateUrl: './payment-result.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentResultComponent {
  private readonly route = inject(ActivatedRoute);
  readonly localOrderId = signal<string | null>(resolveLocalOrderId(this.route));
  readonly hasOrderId = computed(() => !!this.localOrderId());
  readonly status = signal<PaymentStatus>(this.hasOrderId() ? PaymentStatus.PENDING : PaymentStatus.REJECTED);
  readonly polls = signal(0);
  readonly order = signal<Order | null>(null);
  readonly isTerminal = computed(() => this.status() !== PaymentStatus.PENDING);
  protected readonly PaymentStatus = PaymentStatus;
  private readonly payuService = inject(PayuService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly pollIntervalMs = 1500;

  constructor() {
    effect((onCleanup) => {
      const id = this.localOrderId();
      const terminal = this.isTerminal();

      if (!id || terminal) return;

      const sub: Subscription = timer(0, this.pollIntervalMs)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          switchMap(() => this.payuService.getOrderDetails(id))
        )
        .subscribe({
          next: (res) => {
            this.polls.update((currentCount) => currentCount + 1);
            const nextStatus = (res?.paymentStatus ?? PaymentStatus.REJECTED) as PaymentStatus;

            if (nextStatus !== PaymentStatus.PENDING) {
              this.status.set(nextStatus);
              this.order.set(res ?? null);
              safeRemoveLastLocalOrderId();
              sub.unsubscribe();
            }
          },
          error: (err) => {
            console.error(err);
            this.polls.update((v) => v + 1);
            this.status.set(PaymentStatus.REJECTED);
            sub.unsubscribe();
          },
        });

      onCleanup(() => sub.unsubscribe());
    });
  }
}
