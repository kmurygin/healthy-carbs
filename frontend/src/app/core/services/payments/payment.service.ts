import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import type {PaymentSummary} from "@features/payments/dto/payment-summary";
import type {Observable} from "rxjs";
import {map} from "rxjs";
import type {ApiResponse} from "@core/models/api-response.model";
import {ApiEndpoints} from "@core/constants/api-endpoints";

@Injectable({
  providedIn: 'root'
})
export class PaymentsService {
  private readonly httpClient = inject(HttpClient);

  listMyPayments(): Observable<PaymentSummary[] | null> {
    return this.httpClient
      .get<ApiResponse<PaymentSummary[]>>(ApiEndpoints.Payments.Payments)
      .pipe(
        map(resp => resp.data ?? null)
      );
  }
}
