import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PaymentsService} from '@core/services/payments/payment.service';
import {toSignal} from '@angular/core/rxjs-interop';
import {catchError, map, of, startWith} from 'rxjs';
import {ErrorMessageComponent} from '@shared/components/error-message/error-message.component';
import {StatusTagComponent} from "@features/payments/status-tag/status-tag.component";
import type {PaymentHistoryRow, PaymentState} from "@features/payments/payment-history.util";
import {buildRows} from "@features/payments/payment-history.util";
import type {PaymentHistoryItem} from "@features/payments/payment-history-item";

@Component({
  selector: 'app-payments-history',
  imports: [CommonModule, StatusTagComponent, ErrorMessageComponent],
  templateUrl: './payments-history.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentsHistoryComponent {
  private readonly paymentsService = inject(PaymentsService);
  private readonly initialState: PaymentState = {
    rows: [],
    loading: true,
    error: null,
  };

  private readonly state = toSignal(
    this.paymentsService.listMyPayments().pipe(
      map((data) => ({
        rows: data as PaymentHistoryItem[],
        loading: false,
        error: null,
      })),
      startWith(this.initialState),
      catchError(() => {
        const fallbackState: PaymentState = {
          rows: [],
          loading: false,
          error: 'Failed to load payments.',
        };
        return of(fallbackState);
      }),
    ),
    {initialValue: this.initialState},
  );

  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  private readonly paymentItems = computed(() => this.state().rows);

  readonly rows = computed<readonly PaymentHistoryRow[]>(() =>
    buildRows(this.paymentItems()),
  );
}
