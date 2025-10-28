import type {Product} from "./product";

export interface Offer {
  id: string;
  title: string;
  description: string;
  pricePln: number;
  features: string[];
  orderId: string;
  product: Product;
}
