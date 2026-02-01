import {TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient} from '@angular/common/http';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

import {PasswordRecoveryService} from './password-recovery.service';
import {ApiEndpoints} from '@core/constants/api-endpoints';

describe('PasswordRecoveryService', () => {
  let service: PasswordRecoveryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PasswordRecoveryService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PasswordRecoveryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('service_whenInjected_shouldBeTruthy', () => {
    expect(service).toBeTruthy();
  });

  describe('forgotPassword', () => {
    it('forgotPassword_whenSuccess_shouldReturnResponse', () => {
      const payload = {username: 'testuser'};

      service.forgotPassword(payload).subscribe((res) => {
        expect(res.status).toBe(true);
      });

      const req = httpMock.expectOne(ApiEndpoints.Auth.ForgotPassword);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({status: true, message: 'OTP sent'});
    });

    it('forgotPassword_whenStatusFalse_shouldThrowError', () => {
      service.forgotPassword({username: 'testuser'}).subscribe({
        error: (err: unknown) => {
          expect((err as Error).message).toContain('Operation failed');
        },
      });

      const req = httpMock.expectOne(ApiEndpoints.Auth.ForgotPassword);
      req.flush({status: false});
    });

    it('forgotPassword_whenStatusFalseWithMessage_shouldThrowWithMessage', () => {
      service.forgotPassword({username: 'testuser'}).subscribe({
        error: (err: unknown) => {
          expect((err as Error).message).toBe('Email not found');
        },
      });

      const req = httpMock.expectOne(ApiEndpoints.Auth.ForgotPassword);
      req.flush({status: false, message: 'Email not found'});
    });
  });

  describe('verifyOtp', () => {
    it('verifyOtp_whenSuccess_shouldReturnResponse', () => {
      const payload = {username: 'testuser', otp: '123456'};

      service.verifyOtp(payload).subscribe((res) => {
        expect(res.status).toBe(true);
      });

      const req = httpMock.expectOne(ApiEndpoints.Auth.VerifyOtp);
      expect(req.request.method).toBe('POST');
      req.flush({status: true});
    });

    it('verifyOtp_whenStatusFalse_shouldThrowError', () => {
      service.verifyOtp({username: 'testuser', otp: 'wrong'}).subscribe({
        error: (err: unknown) => {
          expect((err as Error).message).toContain('Invalid OTP');
        },
      });

      const req = httpMock.expectOne(ApiEndpoints.Auth.VerifyOtp);
      req.flush({status: false, message: 'Invalid OTP'});
    });
  });

  describe('resetPassword', () => {
    it('resetPassword_whenSuccess_shouldReturnResponse', () => {
      const payload = {username: 'testuser', otp: '1234', newPassword: 'newpass123'};

      service.resetPassword(payload).subscribe((res) => {
        expect(res.status).toBe(true);
      });

      const req = httpMock.expectOne(ApiEndpoints.Auth.ResetPassword);
      expect(req.request.method).toBe('POST');
      req.flush({status: true});
    });

    it('resetPassword_whenStatusFalse_shouldThrowError', () => {
      service.resetPassword({username: 'testuser', otp: '1234', newPassword: 'short'}).subscribe({
        error: (err: unknown) => {
          expect((err as Error).message).toBe('Password too weak');
        },
      });

      const req = httpMock.expectOne(ApiEndpoints.Auth.ResetPassword);
      req.flush({status: false, message: 'Password too weak'});
    });
  });
});
