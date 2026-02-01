import {TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient} from '@angular/common/http';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

import {UserService} from './user.service';
import {ApiEndpoints} from '@core/constants/api-endpoints';
import {createMockUser} from '@testing/test-data.util';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  const mockUser = createMockUser();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('service_whenInjected_shouldBeTruthy', () => {
    expect(service).toBeTruthy();
  });

  describe('getUserByUsername', () => {
    it('getUserByUsername_whenCalled_shouldGetUser', () => {
      service.getUserByUsername('tomriddle').subscribe((res) => {
        expect(res.data).toEqual(mockUser);
      });

      const req = httpMock.expectOne(ApiEndpoints.User.GetByUsername + 'tomriddle');
      expect(req.request.method).toBe('GET');
      req.flush({data: mockUser});
    });
  });

  describe('getCachedUserByUsername', () => {
    it('getCachedUserByUsername_whenNotCached_shouldFetchAndCache', () => {
      service.getCachedUserByUsername('tomriddle').subscribe((user) => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne(ApiEndpoints.User.GetByUsername + 'tomriddle');
      req.flush({data: mockUser});
    });

    it('getCachedUserByUsername_whenCached_shouldReturnFromCache', () => {
      service.getCachedUserByUsername('tomriddle').subscribe();
      const req = httpMock.expectOne(ApiEndpoints.User.GetByUsername + 'tomriddle');
      req.flush({data: mockUser});

      service.getCachedUserByUsername('tomriddle').subscribe((user) => {
        expect(user).toEqual(mockUser);
      });
      httpMock.expectNone(ApiEndpoints.User.GetByUsername + 'tomriddle');
    });

    it('getCachedUserByUsername_whenDifferentUsername_shouldFetchAgain', () => {
      service.getCachedUserByUsername('tomriddle').subscribe();
      httpMock.expectOne(ApiEndpoints.User.GetByUsername + 'tomriddle').flush({data: mockUser});

      const otherUser = createMockUser({id: 2, username: 'other'});
      service.getCachedUserByUsername('other').subscribe((user) => {
        expect(user).toEqual(otherUser);
      });
      const req = httpMock.expectOne(ApiEndpoints.User.GetByUsername + 'other');
      req.flush({data: otherUser});
    });
  });

  describe('refreshUserByUsername', () => {
    it('refreshUserByUsername_whenCalled_shouldAlwaysFetch', () => {
      service.refreshUserByUsername('tomriddle').subscribe((user) => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne(ApiEndpoints.User.GetByUsername + 'tomriddle');
      req.flush({data: mockUser});
    });
  });

  describe('getUserById', () => {
    it('getUserById_whenFound_shouldReturnUser', () => {
      service.getUserById(1).subscribe((user) => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${ApiEndpoints.User.Base}1`);
      expect(req.request.method).toBe('GET');
      req.flush({data: mockUser});
    });

    it('getUserById_whenDataNull_shouldReturnNull', () => {
      service.getUserById(1).subscribe((user) => {
        expect(user).toBeNull();
      });

      const req = httpMock.expectOne(`${ApiEndpoints.User.Base}1`);
      req.flush({data: null});
    });
  });

  describe('updateUser', () => {
    it('updateUser_whenCalled_shouldPutUser', () => {
      service.updateUser(1, mockUser).subscribe((res) => {
        expect(res.data).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${ApiEndpoints.User.Base}1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockUser);
      req.flush({data: mockUser});
    });
  });

  describe('currentUserImageUrl', () => {
    it('currentUserImageUrl_whenNoUser_shouldReturnNull', () => {
      expect(service.currentUserImageUrl()).toBeNull();
    });

    it('currentUserImageUrl_whenUserWithProfileImage_shouldReturnApiUrl', () => {
      const userWithImage = createMockUser({profileImageId: 99});

      service.refreshUserByUsername(userWithImage.username).subscribe();
      const req = httpMock.expectOne(ApiEndpoints.User.GetByUsername + userWithImage.username);
      req.flush({data: userWithImage});

      const url = service.currentUserImageUrl();
      expect(url).not.toBeNull();
      expect(url).toContain('image');
    });

    it('currentUserImageUrl_whenUserWithoutProfileImage_shouldReturnFallbackAvatar', () => {
      const userWithoutImage = createMockUser({profileImageId: null});

      service.refreshUserByUsername(userWithoutImage.username).subscribe();
      const req = httpMock.expectOne(ApiEndpoints.User.GetByUsername + userWithoutImage.username);
      req.flush({data: userWithoutImage});

      const url = service.currentUserImageUrl();
      expect(url).not.toBeNull();
      expect(url).toContain('ui-avatars.com');
    });
  });
});
