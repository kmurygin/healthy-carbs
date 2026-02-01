import {TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient} from '@angular/common/http';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

import {DietitianService} from './dietitian.service';
import {ApiEndpoints} from '@core/constants/api-endpoints';
import {createMockDietaryProfile, createMockMealPlan, createMockUser} from '@testing/test-data.util';
import type {UserMeasurement} from '@core/services/user-measurement/user-measurement.service';

describe('DietitianService', () => {
  let service: DietitianService;
  let httpMock: HttpTestingController;

  const mockUser = createMockUser();
  const mockMeasurement: UserMeasurement = {date: '2026-01-01', weight: 75};

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DietitianService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DietitianService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('service_whenInjected_shouldBeTruthy', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllDietitians', () => {
    it('getAllDietitians_whenSuccess_shouldReturnDietitians', () => {
      service.getAllDietitians().subscribe((dietitians) => {
        expect(dietitians).toEqual([mockUser]);
      });

      const req = httpMock.expectOne(ApiEndpoints.Dietitian.Base);
      expect(req.request.method).toBe('GET');
      req.flush({data: [mockUser]});
    });

    it('getAllDietitians_whenDataNull_shouldReturnEmptyArray', () => {
      service.getAllDietitians().subscribe((dietitians) => {
        expect(dietitians).toEqual([]);
      });

      const req = httpMock.expectOne(ApiEndpoints.Dietitian.Base);
      req.flush({data: null});
    });
  });

  describe('requestCollaboration', () => {
    it('requestCollaboration_whenCalled_shouldPostToEndpoint', () => {
      service.requestCollaboration(1).subscribe((res) => {
        expect(res).toBeUndefined();
      });

      const req = httpMock.expectOne(ApiEndpoints.Dietitian.Collaboration(1));
      expect(req.request.method).toBe('POST');
      req.flush({});
    });
  });

  describe('getProfileImageUrl', () => {
    it('getProfileImageUrl_whenCalled_shouldReturnUrl', () => {
      const url = service.getProfileImageUrl(1, 42);
      expect(url).toContain('1/image');
    });
  });

  describe('getMyClients', () => {
    it('getMyClients_whenSuccess_shouldReturnClients', () => {
      service.getMyClients().subscribe((clients) => {
        expect(clients).toEqual([mockUser]);
      });

      const req = httpMock.expectOne(`${ApiEndpoints.Dietitian.Base}/clients`);
      expect(req.request.method).toBe('GET');
      req.flush({data: [mockUser]});
    });

    it('getMyClients_whenDataNull_shouldReturnEmptyArray', () => {
      service.getMyClients().subscribe((clients) => {
        expect(clients).toEqual([]);
      });

      const req = httpMock.expectOne(`${ApiEndpoints.Dietitian.Base}/clients`);
      req.flush({data: null});
    });
  });

  describe('getClientMeasurements', () => {
    it('getClientMeasurements_whenSuccess_shouldReturnMeasurements', () => {
      service.getClientMeasurements(1).subscribe((measurements) => {
        expect(measurements).toEqual([mockMeasurement]);
      });

      const req = httpMock.expectOne(`${ApiEndpoints.Dietitian.Base}/clients/1/measurements`);
      expect(req.request.method).toBe('GET');
      req.flush({data: [mockMeasurement]});
    });

    it('getClientMeasurements_whenDataNull_shouldReturnEmptyArray', () => {
      service.getClientMeasurements(1).subscribe((measurements) => {
        expect(measurements).toEqual([]);
      });

      const req = httpMock.expectOne(`${ApiEndpoints.Dietitian.Base}/clients/1/measurements`);
      req.flush({data: null});
    });
  });

  describe('getClientDietaryProfile', () => {
    it('getClientDietaryProfile_whenSuccess_shouldReturnProfile', () => {
      const mockProfile = createMockDietaryProfile();

      service.getClientDietaryProfile(1).subscribe((profile) => {
        expect(profile).toEqual(mockProfile);
      });

      const req = httpMock.expectOne(`${ApiEndpoints.Dietitian.Base}/clients/1/dietary-profile`);
      expect(req.request.method).toBe('GET');
      req.flush({data: mockProfile});
    });

    it('getClientDietaryProfile_whenDataNull_shouldReturnNull', () => {
      service.getClientDietaryProfile(1).subscribe((profile) => {
        expect(profile).toBeNull();
      });

      const req = httpMock.expectOne(`${ApiEndpoints.Dietitian.Base}/clients/1/dietary-profile`);
      req.flush({data: null});
    });
  });

  describe('getClientMealPlans', () => {
    it('getClientMealPlans_whenSuccess_shouldReturnPlans', () => {
      const mockPlans = [createMockMealPlan()];

      service.getClientMealPlans(1).subscribe((plans) => {
        expect(plans).toEqual(mockPlans);
      });

      const req = httpMock.expectOne(`${ApiEndpoints.Dietitian.Base}/clients/1/meal-plans`);
      expect(req.request.method).toBe('GET');
      req.flush({data: mockPlans});
    });

    it('getClientMealPlans_whenDataNull_shouldReturnEmptyArray', () => {
      service.getClientMealPlans(1).subscribe((plans) => {
        expect(plans).toEqual([]);
      });

      const req = httpMock.expectOne(`${ApiEndpoints.Dietitian.Base}/clients/1/meal-plans`);
      req.flush({data: null});
    });
  });
});
