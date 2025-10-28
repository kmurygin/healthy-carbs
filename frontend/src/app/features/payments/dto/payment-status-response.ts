import type {PaymentStatus} from "./payment-status.enum";

export interface PaymentStatusResponse {
  localOrderId: string;
  status: PaymentStatus;
}
