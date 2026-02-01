import {TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient} from '@angular/common/http';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

import {UserProfileImageService} from './user-profile-image.service';
import {ApiEndpoints} from '@core/constants/api-endpoints';

describe('UserProfileImageService', () => {
  let service: UserProfileImageService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserProfileImageService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserProfileImageService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('service_whenInjected_shouldBeTruthy', () => {
    expect(service).toBeTruthy();
  });

  describe('uploadProfileImage', () => {
    it('uploadProfileImage_whenCalled_shouldPostFormData', () => {
      const file = new File(['img'], 'avatar.png', {type: 'image/png'});

      service.uploadProfileImage(1, file).subscribe((res) => {
        expect(res).toBeDefined();
      });

      const req = httpMock.expectOne(`${ApiEndpoints.User.Base}1/image`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBe(true);
      req.flush({status: true});
    });
  });

  describe('getProfileImageUrl', () => {
    it('getProfileImageUrl_whenNoCacheKey_shouldReturnBaseUrl', () => {
      const url = service.getProfileImageUrl(1);
      expect(url).toBe(`${ApiEndpoints.User.Base}1/image`);
    });

    it('getProfileImageUrl_whenCacheKeyNull_shouldReturnBaseUrl', () => {
      const url = service.getProfileImageUrl(1, null);
      expect(url).toBe(`${ApiEndpoints.User.Base}1/image`);
    });

    it('getProfileImageUrl_whenCacheKeyProvided_shouldAppendQueryParam', () => {
      const url = service.getProfileImageUrl(1, 42);
      expect(url).toBe(`${ApiEndpoints.User.Base}1/image?v=42`);
    });

    it('getProfileImageUrl_whenCacheKeyIsString_shouldAppendEncodedParam', () => {
      const url = service.getProfileImageUrl(1, 'abc');
      expect(url).toBe(`${ApiEndpoints.User.Base}1/image?v=abc`);
    });
  });
});
