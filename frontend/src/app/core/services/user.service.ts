import {inject, Injectable} from '@angular/core';
import {ApiResponse, ChangePasswordPayload} from "../models/payloads";
import {User} from "../models/user.model";
import {ApiEndpoints} from "../constants/constants";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private httpClient = inject(HttpClient);

  getUserByUsername(username: string) {
    return this.httpClient.get<ApiResponse<User>>(ApiEndpoints.User.GetUserByUsername + username);
  }

  updateUser(id: number, updatedUser: User) {
    return this.httpClient.put<ApiResponse<User>>(ApiEndpoints.User.User + id, updatedUser);
  }

  changePassword(changePasswordPayload: ChangePasswordPayload) {
    return this.httpClient.post<ApiResponse<any>>(ApiEndpoints.User.ChangePassword, changePasswordPayload);
  }
}
