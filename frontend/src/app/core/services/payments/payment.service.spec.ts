import {TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient} from '@angular/common/http';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

import {PaymentsService} from './payment.service';
import {ApiEndpoints} from '@core/constants/api-endpoints';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let httpMock: HttpTestingController;

  const mockPayment = {id: 'pay-1', amount: 2999, currency: 'PLN', status: 'COMPLETED'};

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PaymentsService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PaymentsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('service_whenInjected_shouldBeTruthy', () => {
    expect(service).toBeTruthy();
  });

  describe('listMyPayments', () => {
    it('listMyPayments_whenSuccess_shouldReturnPayments', () => {
      service.listMyPayments().subscribe((payments) => {
        expect(payments).toEqual([mockPayment]);
      });

      const req = httpMock.expectOne(ApiEndpoints.Payments.Base);
      expect(req.request.method).toBe('GET');
      req.flush({data: [mockPayment]});
    });

    it('listMyPayments_whenDataNull_shouldReturnNull', () => {
      service.listMyPayments().subscribe((payments) => {
        expect(payments).toBeNull();
      });

      const req = httpMock.expectOne(ApiEndpoints.Payments.Base);
      req.flush({data: null});
    });
  });
});
