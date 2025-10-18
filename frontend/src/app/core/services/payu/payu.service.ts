import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import type {InitPaymentRequest} from "../../../features/payments/dto/init-payment-request";
import type {InitPaymentResponse} from "../../../features/payments/dto/init-payment-response";
import type {Order} from "../../../features/payments/dto/order";
import type {ApiResponse} from "../../models/api-response.model";
import {ApiEndpoints} from "../../constants/api-endpoints";
import type {PaymentStatusResponse} from "../../../features/payments/dto/payment-status-response";

@Injectable({
  providedIn: 'root'
})
export class PayuService {
  private readonly httpClient = inject(HttpClient);

  createPayment(payload: InitPaymentRequest) {
    return this.httpClient.post<ApiResponse<InitPaymentResponse>>(ApiEndpoints.Payment.Create, payload);
  }

  getStatus(localOrderId: string) {
    return this.httpClient.get<ApiResponse<PaymentStatusResponse>>(ApiEndpoints.Payment.Status + localOrderId);
  }

  getOrderDetails(localOrderId: string) {
    return this.httpClient.get<ApiResponse<Order>>(ApiEndpoints.Payment.Order + localOrderId);
  }

}
