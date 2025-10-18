import type {Product} from "./product";

export interface InitPaymentRequest {
  localOrderId: string;
  description: string;
  totalAmount: number;
  products: Product[];
}
