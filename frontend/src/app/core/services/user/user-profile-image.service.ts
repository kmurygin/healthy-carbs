import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import type {Observable} from 'rxjs';
import {ApiEndpoints} from '@core/constants/api-endpoints';
import type {ApiResponse} from '@core/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class UserProfileImageService {
  private readonly httpClient = inject(HttpClient);

  uploadProfileImage(userId: number, file: File): Observable<ApiResponse<void>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.httpClient.post<ApiResponse<void>>(
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
}
