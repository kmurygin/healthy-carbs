import type {PaymentHistoryItem} from "@features/payments/payment-history-item";

export interface PaymentState {
  readonly rows: PaymentHistoryItem[];
  readonly loading: boolean;
  readonly error: string | null;
}

export type PaymentHistoryRow = Readonly<{
  idx: number;
  id: string | number;
  createdAt: string | Date;
  status: string;
  orderId: string;
  amount: number;
  currency: string;
  provider: string;
  raw: PaymentHistoryItem;
}>;

export function convertToTimestamp(value: string | Date): number {
  return (value instanceof Date ? value : new Date(value)).getTime();
}

export function toRow(item: PaymentHistoryItem, idx: number): PaymentHistoryRow {
  return {
    idx,
    id: item.id,
    createdAt: item.createdAt,
    status: item.status,
    orderId: item.orderId,
    amount: item.amount / 100,
    currency: item.currency,
    provider: item.provider,
    raw: item,
  };
}

export function buildRows(
  items: readonly PaymentHistoryItem[],
): readonly PaymentHistoryRow[] {
  return items
    .slice()
    .sort((a, b) => {
      return convertToTimestamp(b.createdAt) - convertToTimestamp(a.createdAt);
    })
    .map(toRow);
}
