import {TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient} from '@angular/common/http';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

import {OfferService} from './offer.service';
import {ApiEndpoints} from '@core/constants/api-endpoints';

describe('OfferService', () => {
  let service: OfferService;
  let httpMock: HttpTestingController;

  const mockOffer = {id: 1, name: 'Basic Plan', price: 2999, durationDays: 30};

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OfferService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(OfferService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('service_whenInjected_shouldBeTruthy', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('getAll_whenSuccess_shouldReturnOffers', () => {
      service.getAll().subscribe((offers) => {
        expect(offers).toEqual([mockOffer]);
      });

      const req = httpMock.expectOne(ApiEndpoints.Offer.Base);
      expect(req.request.method).toBe('GET');
      req.flush({data: [mockOffer]});
    });

    it('getAll_whenDataNull_shouldReturnNull', () => {
      service.getAll().subscribe((offers) => {
        expect(offers).toBeNull();
      });

      const req = httpMock.expectOne(ApiEndpoints.Offer.Base);
      req.flush({data: null});
    });
  });
});
