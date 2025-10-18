import {inject, Injectable} from '@angular/core';
import type {ChangePasswordPayload} from "../../models/payloads";
import type {UserDto} from "../../models/dto/user.dto";
import {ApiEndpoints} from "../../constants/api-endpoints";
import {HttpClient} from "@angular/common/http";
import type {ApiResponse} from "../../models/api-response.model";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private httpClient = inject(HttpClient);

  getUserByUsername(username: string) {
    return this.httpClient.get<ApiResponse<UserDto>>(ApiEndpoints.User.GetUserByUsername + username);
  }

  updateUser(id: number, updatedUser: UserDto) {
    return this.httpClient.put<ApiResponse<UserDto>>(ApiEndpoints.User.User + id, updatedUser);
  }

  changePassword(changePasswordPayload: ChangePasswordPayload) {
    return this.httpClient.post<ApiResponse<UserDto>>(ApiEndpoints.User.ChangePassword, changePasswordPayload);
  }
}
