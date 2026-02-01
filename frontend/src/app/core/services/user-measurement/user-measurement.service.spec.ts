import {TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient} from '@angular/common/http';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

import type {MeasurementPayload, UserMeasurement} from './user-measurement.service';
import {UserMeasurementService} from './user-measurement.service';
import {ApiEndpoints} from '@core/constants/api-endpoints';

describe('UserMeasurementService', () => {
  let service: UserMeasurementService;
  let httpMock: HttpTestingController;

  const mockMeasurement: UserMeasurement = {
    date: '2026-01-01T10:00:00Z',
    weight: 75,
    waistCircumference: 80,
  };

  const mockPayload: MeasurementPayload = {
    weight: 75,
    waistCircumference: 80,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserMeasurementService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserMeasurementService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('service_whenInjected_shouldBeTruthy', () => {
    expect(service).toBeTruthy();
  });

  describe('addMeasurement', () => {
    it('addMeasurement_whenCalled_shouldPostPayload', () => {
      service.addMeasurement(mockPayload).subscribe((res) => {
        expect(res).toBeDefined();
      });

      const req = httpMock.expectOne(ApiEndpoints.Measurements.Base);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockPayload);
      req.flush({status: true});
    });
  });

  describe('updateRecentMeasurement', () => {
    it('updateRecentMeasurement_whenCalled_shouldPutPayload', () => {
      service.updateRecentMeasurement(mockPayload).subscribe((res) => {
        expect(res).toBeDefined();
      });

      const req = httpMock.expectOne(`${ApiEndpoints.Measurements.Base}/recent`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockPayload);
      req.flush({status: true});
    });
  });

  describe('getAllHistory', () => {
    it('getAllHistory_whenSuccess_shouldReturnMeasurements', () => {
      service.getAllHistory().subscribe((measurements) => {
        expect(measurements).toEqual([mockMeasurement]);
      });

      const req = httpMock.expectOne(ApiEndpoints.Measurements.Base);
      expect(req.request.method).toBe('GET');
      req.flush({data: [mockMeasurement]});
    });

    it('getAllHistory_whenDataNull_shouldReturnNull', () => {
      service.getAllHistory().subscribe((measurements) => {
        expect(measurements).toBeNull();
      });

      const req = httpMock.expectOne(ApiEndpoints.Measurements.Base);
      req.flush({data: null});
    });

    it('getAllHistory_whenHttpError_shouldReturnNull', () => {
      service.getAllHistory().subscribe((measurements) => {
        expect(measurements).toBeNull();
      });

      const req = httpMock.expectOne(ApiEndpoints.Measurements.Base);
      req.flush('Server error', {status: 500, statusText: 'Internal Server Error'});
    });
  });

  describe('canAddMeasurement', () => {
    it('canAddMeasurement_whenHistoryEmpty_shouldReturnAllowed', () => {
      const result = service.canAddMeasurement([]);
      expect(result.allowed).toBe(true);
      expect(result.remainingMs).toBe(0);
    });

    it('canAddMeasurement_whenLastMeasurementOlderThan24h_shouldReturnAllowed', () => {
      const oldDate = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
      const result = service.canAddMeasurement([{date: oldDate, weight: 70}]);
      expect(result.allowed).toBe(true);
      expect(result.remainingMs).toBe(0);
    });

    it('canAddMeasurement_whenLastMeasurementWithin24h_shouldReturnNotAllowed', () => {
      const recentDate = new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString();
      const result = service.canAddMeasurement([{date: recentDate, weight: 70}]);
      expect(result.allowed).toBe(false);
      expect(result.remainingMs).toBeGreaterThan(0);
    });

    it('canAddMeasurement_whenMultipleMeasurementsAndLatestIsRecent_shouldReturnNotAllowed', () => {
      const oldDate = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      const recentDate = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      const result = service.canAddMeasurement([
        {date: oldDate, weight: 68},
        {date: recentDate, weight: 70},
      ]);
      expect(result.allowed).toBe(false);
      expect(result.remainingMs).toBeGreaterThan(0);
    });

    it('canAddMeasurement_whenMultipleMeasurementsAllOld_shouldReturnAllowed', () => {
      const old1 = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      const old2 = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
      const result = service.canAddMeasurement([
        {date: old1, weight: 68},
        {date: old2, weight: 70},
      ]);
      expect(result.allowed).toBe(true);
      expect(result.remainingMs).toBe(0);
    });
  });
});
