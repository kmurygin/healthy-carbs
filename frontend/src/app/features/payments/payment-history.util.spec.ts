import {describe, expect, it} from 'vitest';

import {buildRows, convertToTimestamp, toRow} from './payment-history.util';
import type {PaymentHistoryItem} from './payment-history-item';
import {PaymentStatus} from '@features/payments/dto/payment-status.enum';

describe('payment-history.util', () => {
  const mockItem: PaymentHistoryItem = {
    id: 'pay-1',
    createdAt: '2026-01-15T10:00:00Z',
    status: PaymentStatus.COMPLETED,
    orderId: 'order-1',
    amount: 2999,
    currency: 'PLN',
    provider: 'PayU',
  };

  describe('convertToTimestamp', () => {
    it('convertToTimestamp_whenString_shouldReturnTimestamp', () => {
      const result = convertToTimestamp('2026-01-01T00:00:00Z');
      expect(result).toBe(new Date('2026-01-01T00:00:00Z').getTime());
    });

    it('convertToTimestamp_whenDate_shouldReturnTimestamp', () => {
      const date = new Date('2026-01-01T00:00:00Z');
      const result = convertToTimestamp(date);
      expect(result).toBe(date.getTime());
    });
  });

  describe('toRow', () => {
    it('toRow_whenCalled_shouldMapFieldsCorrectly', () => {
      const row = toRow(mockItem, 0);
      expect(row.idx).toBe(0);
      expect(row.id).toBe('pay-1');
      expect(row.createdAt).toBe('2026-01-15T10:00:00Z');
      expect(row.status).toBe('COMPLETED');
      expect(row.orderId).toBe('order-1');
      expect(row.amount).toBe(29.99);
      expect(row.currency).toBe('PLN');
      expect(row.provider).toBe('PayU');
      expect(row.raw).toBe(mockItem);
    });

    it('toRow_whenAmountIsZero_shouldReturnZero', () => {
      const item = {...mockItem, amount: 0};
      const row = toRow(item, 0);
      expect(row.amount).toBe(0);
    });
  });

  describe('buildRows', () => {
    it('buildRows_whenEmpty_shouldReturnEmptyArray', () => {
      const rows = buildRows([]);
      expect(rows).toEqual([]);
    });

    it('buildRows_whenMultipleItems_shouldSortByDateDescending', () => {
      const items: PaymentHistoryItem[] = [
        {...mockItem, id: '1', createdAt: '2026-01-01T00:00:00Z'},
        {...mockItem, id: '2', createdAt: '2026-01-15T00:00:00Z'},
        {...mockItem, id: '3', createdAt: '2026-01-10T00:00:00Z'},
      ];

      const rows = buildRows(items);
      expect(rows[0].id).toBe('2');
      expect(rows[1].id).toBe('3');
      expect(rows[2].id).toBe('1');
    });

    it('buildRows_whenCalled_shouldAssignCorrectIndices', () => {
      const items: PaymentHistoryItem[] = [
        {...mockItem, id: '1', createdAt: '2026-01-01T00:00:00Z'},
        {...mockItem, id: '2', createdAt: '2026-01-15T00:00:00Z'},
      ];

      const rows = buildRows(items);
      expect(rows[0].idx).toBe(0);
      expect(rows[1].idx).toBe(1);
    });

    it('buildRows_whenCalled_shouldNotMutateOriginalArray', () => {
      const items: PaymentHistoryItem[] = [
        {...mockItem, id: '1', createdAt: '2026-01-01T00:00:00Z'},
        {...mockItem, id: '2', createdAt: '2026-01-15T00:00:00Z'},
      ];

      const original = [...items];
      buildRows(items);
      expect(items[0].id).toBe(original[0].id);
      expect(items[1].id).toBe(original[1].id);
    });
  });
});
