import type {PaymentStatus} from "@features/payments/dto/payment-status.enum";

export interface PaymentSummary {
  id: number;
  provider: string;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
}
