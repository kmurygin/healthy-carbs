import {TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient} from '@angular/common/http';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

import {DietaryProfileService} from './dietary-profile.service';
import {ApiEndpoints} from '@core/constants/api-endpoints';
import {createMockDietaryProfile} from '@testing/test-data.util';
import type {DietaryProfilePayload} from '@core/models/payloads/dietaryprofile.payload';

describe('DietaryProfileService', () => {
  let service: DietaryProfileService;
  let httpMock: HttpTestingController;

  const mockProfile = createMockDietaryProfile();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DietaryProfileService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DietaryProfileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('service_whenInjected_shouldBeTruthy', () => {
    expect(service).toBeTruthy();
  });

  describe('save', () => {
    it('save_whenSuccess_shouldReturnProfile', () => {
      const payload: DietaryProfilePayload = {
        age: 30,
        gender: 'MALE',
        weight: 80,
        height: 180,
        dietGoal: 'MAINTAIN',
        dietType: 'BALANCED',
        activityLevel: 'MODERATE',
        allergies: []
      };

      service.save(payload).subscribe((profile) => {
        expect(profile).toEqual(mockProfile);
      });

      const req = httpMock.expectOne(ApiEndpoints.DietaryProfiles.Base);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({data: mockProfile});
    });

    it('save_whenDataNull_shouldReturnNull', () => {
      const invalidReq: DietaryProfilePayload = {} as any;
      service.save(invalidReq).subscribe((profile) => {
        expect(profile).toBeNull();
      });

      const req = httpMock.expectOne(ApiEndpoints.DietaryProfiles.Base);
      req.flush({data: null});
    });
  });

  describe('getProfile', () => {
    it('getProfile_whenSuccess_shouldReturnProfile', () => {
      service.getProfile().subscribe((profile) => {
        expect(profile).toEqual(mockProfile);
      });

      const req = httpMock.expectOne(ApiEndpoints.DietaryProfiles.Base);
      expect(req.request.method).toBe('GET');
      req.flush({data: mockProfile});
    });

    it('getProfile_whenDataNull_shouldReturnNull', () => {
      service.getProfile().subscribe((profile) => {
        expect(profile).toBeNull();
      });

      const req = httpMock.expectOne(ApiEndpoints.DietaryProfiles.Base);
      req.flush({data: null});
    });
  });
});
