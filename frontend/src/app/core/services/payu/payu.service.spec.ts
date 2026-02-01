import {TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient} from '@angular/common/http';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

import {PayuService} from './payu.service';
import {ApiEndpoints} from '@core/constants/api-endpoints';
import type {InitPaymentRequest} from '@features/payments/dto/init-payment-request';

describe('PayuService', () => {
  let service: PayuService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PayuService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PayuService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('service_whenInjected_shouldBeTruthy', () => {
    expect(service).toBeTruthy();
  });

  describe('createPayment', () => {
    it('createPayment_whenSuccess_shouldReturnResponse', () => {
      const mockResponse = {redirectUri: 'https://payu.com/pay', orderId: 'order-1'};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: InitPaymentRequest = {offerId: 1, continueUrl: 'https://app.com/result'} as any;

      service.createPayment(payload).subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(ApiEndpoints.PaymentsPayu.Create);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({data: mockResponse});
    });

    it('createPayment_whenDataNull_shouldThrowError', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const invalidReq: InitPaymentRequest = {} as any;
      service.createPayment(invalidReq).subscribe({
        error: (err: unknown) => {
          expect((err as Error).message).toContain('Failed to create payment');
        },
      });

      const req = httpMock.expectOne(ApiEndpoints.PaymentsPayu.Create);
      req.flush({data: null});
    });
  });

  describe('getStatus', () => {
    it('getStatus_whenSuccess_shouldReturnStatus', () => {
      const mockStatus = {status: 'COMPLETED'};

      service.getStatus('order-1').subscribe((status) => {
        expect(status).toEqual(mockStatus);
      });

      const req = httpMock.expectOne(ApiEndpoints.PaymentsPayu.Status + 'order-1');
      expect(req.request.method).toBe('GET');
      req.flush({data: mockStatus});
    });

    it('getStatus_whenDataNull_shouldThrowError', () => {
      service.getStatus('order-1').subscribe({
        error: (err: unknown) => {
          expect((err as Error).message).toContain('Failed to get status');
        },
      });

      const req = httpMock.expectOne(ApiEndpoints.PaymentsPayu.Status + 'order-1');
      req.flush({data: null});
    });
  });

  describe('getOrderDetails', () => {
    it('getOrderDetails_whenSuccess_shouldReturnOrder', () => {
      const mockOrder = {orderId: 'order-1', totalAmount: 1000};

      service.getOrderDetails('order-1').subscribe((order) => {
        expect(order).toEqual(mockOrder);
      });

      const req = httpMock.expectOne(ApiEndpoints.PaymentsPayu.Order + 'order-1');
      expect(req.request.method).toBe('GET');
      req.flush({data: mockOrder});
    });

    it('getOrderDetails_whenDataNull_shouldThrowError', () => {
      service.getOrderDetails('order-1').subscribe({
        error: (err: unknown) => {
          expect((err as Error).message).toContain('Failed to get order details');
        },
      });

      const req = httpMock.expectOne(ApiEndpoints.PaymentsPayu.Order + 'order-1');
      req.flush({data: null});
    });
  });
});
