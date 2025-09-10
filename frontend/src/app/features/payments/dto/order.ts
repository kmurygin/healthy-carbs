export interface Order {
  localOrderId: string;
  description: string;
  totalAmount: number;
  currency: string;
  createdAt: Date;
  paymentStatus: string;
}
