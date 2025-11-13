import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import type {InitPaymentRequest} from "@features/payments/dto/init-payment-request";
import type {InitPaymentResponse} from "@features/payments/dto/init-payment-response";
import type {Order} from "@features/payments/dto/order";
import type {ApiResponse} from "../../models/api-response.model";
import {ApiEndpoints} from "../../constants/api-endpoints";
import type {PaymentStatusResponse} from "@features/payments/dto/payment-status-response";
import type {Observable} from "rxjs";
import {map} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PayuService {
  private readonly httpClient = inject(HttpClient);

  createPayment(payload: InitPaymentRequest): Observable<InitPaymentResponse> {
    return this.httpClient
      .post<ApiResponse<InitPaymentResponse>>(ApiEndpoints.PaymentsPayu.Create, payload)
      .pipe(map(response => {
        if (!response.data) {
          throw new Error('Failed to create payment');
        }
        return response.data;
      }));
  }

  getStatus(localOrderId: string) {
    return this.httpClient
      .get<ApiResponse<PaymentStatusResponse>>(ApiEndpoints.PaymentsPayu.Status + localOrderId)
      .pipe(map(response => {
        if (!response.data) {
          throw new Error('Failed to get status');
        }
        return response.data;
      }));
  }

  getOrderDetails(localOrderId: string) {
    return this.httpClient
      .get<ApiResponse<Order>>(ApiEndpoints.PaymentsPayu.Order + localOrderId)
      .pipe(map(response => {
        if (!response.data) {
          throw new Error('Failed to get order details');
        }
        return response.data;
      }));
  }

}
