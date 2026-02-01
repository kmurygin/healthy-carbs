import {TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient} from '@angular/common/http';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

import {UserPasswordService} from './user-password.service';
import {ApiEndpoints} from '@core/constants/api-endpoints';
import type {ChangePasswordPayload} from '@core/models/payloads';

describe('UserPasswordService', () => {
  let service: UserPasswordService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserPasswordService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserPasswordService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('service_whenInjected_shouldBeTruthy', () => {
    expect(service).toBeTruthy();
  });

  describe('changePassword', () => {
    it('changePassword_whenSuccess_shouldPostPayloadAndReturnResponse', () => {
      const payload: ChangePasswordPayload = {oldPassword: 'old123', newPassword: 'new456'};
      const mockResponse = {status: true, data: null};

      service.changePassword(payload).subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(ApiEndpoints.User.ChangePassword);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockResponse);
    });

    it('changePassword_whenHttpError_shouldPropagateError', () => {
      const payload: ChangePasswordPayload = {oldPassword: 'old123', newPassword: 'new456'};

      service.changePassword(payload).subscribe({
        next: () => expect.unreachable('should have errored'),
        error: (err: unknown) => {
          expect((err as { status: number }).status).toBe(400);
        },
      });

      const req = httpMock.expectOne(ApiEndpoints.User.ChangePassword);
      req.flush({message: 'Invalid password'}, {status: 400, statusText: 'Bad Request'});
    });
  });
});
