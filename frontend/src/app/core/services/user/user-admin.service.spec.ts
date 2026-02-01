import {TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient} from '@angular/common/http';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

import {UserAdminService} from './user-admin.service';
import {ApiEndpoints} from '@core/constants/api-endpoints';
import {UserRole} from '@core/models/enum/user-role.enum';
import {createMockUser} from '@testing/test-data.util';

describe('UserAdminService', () => {
  let service: UserAdminService;
  let httpMock: HttpTestingController;

  const mockUser = createMockUser();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserAdminService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserAdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('service_whenInjected_shouldBeTruthy', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllUsers', () => {
    it('getAllUsers_whenSuccess_shouldReturnUsers', () => {
      service.getAllUsers().subscribe((users) => {
        expect(users).toEqual([mockUser]);
      });

      const req = httpMock.expectOne(ApiEndpoints.Admin.Users.GetAll);
      expect(req.request.method).toBe('GET');
      req.flush({data: [mockUser]});
    });

    it('getAllUsers_whenDataNull_shouldReturnEmptyArray', () => {
      service.getAllUsers().subscribe((users) => {
        expect(users).toEqual([]);
      });

      const req = httpMock.expectOne(ApiEndpoints.Admin.Users.GetAll);
      req.flush({data: null});
    });
  });

  describe('deleteUser', () => {
    it('deleteUser_whenSuccess_shouldReturnVoid', () => {
      service.deleteUser(1).subscribe((result) => {
        expect(result).toBeUndefined();
      });

      const req = httpMock.expectOne(`${ApiEndpoints.User.Base}1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  describe('changeUserRole', () => {
    it('changeUserRole_whenSuccess_shouldReturnUpdatedUser', () => {
      const updatedUser = createMockUser({role: UserRole.ADMIN});

      service.changeUserRole(1, UserRole.ADMIN).subscribe((user) => {
        expect(user).toEqual(updatedUser);
      });

      const req = httpMock.expectOne(`${ApiEndpoints.Admin.Users.Base}1/role`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({role: UserRole.ADMIN});
      req.flush({data: updatedUser});
    });

    it('changeUserRole_whenDataNull_shouldThrowError', () => {
      service.changeUserRole(1, UserRole.ADMIN).subscribe({
        error: (err: unknown) => {
          expect((err as Error).message).toContain('User data is missing');
        },
      });

      const req = httpMock.expectOne(`${ApiEndpoints.Admin.Users.Base}1/role`);
      req.flush({data: null});
    });
  });

  describe('toggleUserActiveStatus', () => {
    it('toggleUserActiveStatus_whenSuccess_shouldReturnUser', () => {
      const toggledUser = createMockUser({isActive: false});

      service.toggleUserActiveStatus(1).subscribe((user) => {
        expect(user).toEqual(toggledUser);
      });

      const req = httpMock.expectOne(`${ApiEndpoints.Admin.Users.Base}1/toggle-active`);
      expect(req.request.method).toBe('PATCH');
      req.flush({data: toggledUser});
    });

    it('toggleUserActiveStatus_whenDataNull_shouldThrowError', () => {
      service.toggleUserActiveStatus(1).subscribe({
        error: (err: unknown) => {
          expect((err as Error).message).toContain('User data is missing');
        },
      });

      const req = httpMock.expectOne(`${ApiEndpoints.Admin.Users.Base}1/toggle-active`);
      req.flush({data: null});
    });
  });
});
