import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ApiEndpoints} from '@core/constants/api-endpoints';
import type {ApiResponse} from '@core/models/api-response.model';
import type {UserDto} from '@core/models/dto/user.dto';
import type {ChangePasswordPayload} from '@core/models/payloads';

@Injectable({
  providedIn: 'root'
})
export class UserPasswordService {
  private readonly httpClient = inject(HttpClient);

  changePassword(payload: ChangePasswordPayload) {
    return this.httpClient.post<ApiResponse<UserDto>>(
      ApiEndpoints.User.ChangePassword,
      payload
    );
  }
}
