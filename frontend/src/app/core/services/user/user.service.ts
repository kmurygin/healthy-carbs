import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import type {ApiResponse} from '../../models/api-response.model';
import type {UserDto} from '../../models/dto/user.dto';
import type {ChangePasswordPayload} from '../../models/payloads';
import {map, type Observable} from "rxjs";
import {ApiEndpoints} from "@core/constants/api-endpoints";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly httpClient = inject(HttpClient);

  getUserByUsername(username: string) {
    return this.httpClient.get<ApiResponse<UserDto>>(
      ApiEndpoints.User.GetByUsername + username
    );
  }

  getUserById(id: number) {
    return this.httpClient
      .get<ApiResponse<UserDto>>(
        `${ApiEndpoints.User.Base}${id}`
      )
      .pipe(map((resp) => resp.data ?? null));

  }

  updateUser(id: number, updatedUser: UserDto) {
    return this.httpClient.put<ApiResponse<UserDto>>(
      `${ApiEndpoints.User.Base}${id}`,
      updatedUser
    );
  }

  changePassword(changePasswordPayload: ChangePasswordPayload) {
    return this.httpClient.post<ApiResponse<UserDto>>(
      ApiEndpoints.User.ChangePassword,
      changePasswordPayload
    );
  }

  uploadProfileImage(userId: number, file: File): Observable<ApiResponse<void>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.httpClient
      .post<ApiResponse<void>>(
        `${ApiEndpoints.User.Base}${userId}/image`,
        formData
      );
  }

  getProfileImage(imageId: number): Observable<Blob> {
    return this.httpClient.get(
      `${ApiEndpoints.User.Base}images/${imageId}`,
      {responseType: 'blob'}
    );
  }
}
