import type {PaymentStatus} from "./payment-status";

export interface PaymentStatusResponse {
  localOrderId: string;
  status: PaymentStatus;
}
