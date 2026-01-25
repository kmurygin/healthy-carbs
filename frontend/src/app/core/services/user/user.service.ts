import {computed, inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import type {ApiResponse} from '../../models/api-response.model';
import type {UserDto} from '../../models/dto/user.dto';
import type {ChangePasswordPayload} from '../../models/payloads';
import {map, type Observable, of} from "rxjs";
import {ApiEndpoints} from "@core/constants/api-endpoints";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly httpClient = inject(HttpClient);
  private readonly currentUser = signal<UserDto | null>(null);
  readonly currentUserImageUrl = computed(() => {
    const user = this.currentUser();
    if (!user) return null;
    if (user.profileImageId) {
      return this.getProfileImageUrl(user.id, user.profileImageId);
    }
    return this.buildFallbackAvatar(user);
  });

  getUserByUsername(username: string) {
    return this.httpClient.get<ApiResponse<UserDto>>(
      ApiEndpoints.User.GetByUsername + username
    );
  }

  getCachedUserByUsername(username: string): Observable<UserDto | null> {
    const cached = this.currentUser();
    if (cached?.username === username) {
      return of(cached);
    }

    return this.getUserByUsername(username).pipe(
      map((response) => {
        const user = response.data ?? null;
        this.currentUser.set(user);
        return user;
      })
    );
  }

  refreshUserByUsername(username: string): Observable<UserDto | null> {
    return this.getUserByUsername(username).pipe(
      map((response) => {
        const user = response.data ?? null;
        this.currentUser.set(user);
        return user;
      })
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

  getProfileImageUrl(userId: number, cacheKey?: number | string | null): string {
    const baseUrl = `${ApiEndpoints.User.Base}${userId}/image`;
    if (cacheKey == null) {
      return baseUrl;
    }
    return `${baseUrl}?v=${encodeURIComponent(String(cacheKey))}`;
  }

  private buildFallbackAvatar(user: UserDto): string {
    const name = encodeURIComponent(`${user.firstName}+${user.lastName}`);
    return `https://ui-avatars.com/api/?name=${name}`;
  }
}
