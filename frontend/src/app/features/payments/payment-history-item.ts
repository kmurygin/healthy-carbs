import type {PaymentStatus} from "@features/payments/dto/payment-status.enum";

export interface PaymentHistoryItem {
  id: string | number;
  createdAt: string | Date;
  status: PaymentStatus;
  orderId: string;
  amount: number;
  currency: string;
  provider: string;
}
