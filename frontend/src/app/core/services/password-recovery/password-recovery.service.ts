import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs';
import {ApiEndpoints} from '../../constants/api-endpoints';
import type {ApiResponse} from '../../models/api-response.model';
import type {ForgotPasswordPayload} from '../../models/payloads/forgot-password.payload';
import type {VerifyOtpPayload} from '../../models/payloads/verify-otp.payload';
import type {ResetPasswordPayload} from '../../models/payloads/reset-password.payload';

@Injectable({
  providedIn: 'root'
})
export class PasswordRecoveryService {
  private readonly httpClient: HttpClient = inject(HttpClient);

  forgotPassword(payload: ForgotPasswordPayload) {
    return this.httpClient
      .post<ApiResponse<void>>(ApiEndpoints.Auth.ForgotPassword, payload)
      .pipe(this.handleResponse());
  }

  verifyOtp(payload: VerifyOtpPayload) {
    return this.httpClient
      .post<ApiResponse<void>>(ApiEndpoints.Auth.VerifyOtp, payload)
      .pipe(this.handleResponse());
  }

  resetPassword(payload: ResetPasswordPayload) {
    return this.httpClient
      .post<ApiResponse<void>>(ApiEndpoints.Auth.ResetPassword, payload)
      .pipe(this.handleResponse());
  }

  private handleResponse() {
    return map((response: ApiResponse<void>) => {
      if (!response.status) {
        throw new Error(response.message ?? 'Operation failed');
      }
      return response;
    });
  }
}
