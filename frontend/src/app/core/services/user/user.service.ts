import {computed, inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import type {ApiResponse} from '../../models/api-response.model';
import type {UserDto} from '../../models/dto/user.dto';
import {map, type Observable, of} from 'rxjs';
import {ApiEndpoints} from '@core/constants/api-endpoints';
import {UserProfileImageService} from './user-profile-image.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly httpClient = inject(HttpClient);
  private readonly profileImageService = inject(UserProfileImageService);
  private readonly currentUser = signal<UserDto | null>(null);

  readonly currentUserImageUrl = computed(() => {
    const user = this.currentUser();
    if (!user) return null;
    if (user.profileImageId) {
      return this.profileImageService.getProfileImageUrl(user.id, user.profileImageId);
    }
    return this.buildFallbackAvatar(user);
  });

  clearCurrentUser(): void {
    this.currentUser.set(null);
  }

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
      .get<ApiResponse<UserDto>>(`${ApiEndpoints.User.Base}${id}`)
      .pipe(map((resp) => resp.data ?? null));
  }

  updateUser(id: number, updatedUser: UserDto) {
    return this.httpClient.put<ApiResponse<UserDto>>(
      `${ApiEndpoints.User.Base}${id}`,
      updatedUser
    );
  }

  deleteUser(id: number): Observable<void> {
    return this.httpClient
      .delete(`${ApiEndpoints.User.Base}${id}`)
      .pipe(map(() => undefined));
  }

  private buildFallbackAvatar(user: UserDto): string {
    const name = encodeURIComponent(`${user.firstName}+${user.lastName}`);
    return `https://ui-avatars.com/api/?name=${name}`;
  }
}
