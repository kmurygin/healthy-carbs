import { inject, Injectable, type OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, type SafeUrl } from '@angular/platform-browser';
import { map, of, type Observable } from 'rxjs';

import { type ApiResponse } from '../../models/api-response.model';
import { type UserDto } from '../../models/dto/user.dto';
import { ApiEndpoints } from '@core/constants/api-endpoints';
import { UserService } from '@core/services/user/user.service';

@Injectable({ providedIn: 'root' })
export class DietitianService implements OnDestroy {
  private readonly httpClient = inject(HttpClient);
  private readonly userService = inject(UserService);
  private readonly sanitizer = inject(DomSanitizer);

  private readonly objectUrls = new Map<number, string>();
  private readonly safeUrls = new Map<number, SafeUrl>();

  getAllDietitians(): Observable<UserDto[]> {
    return this.httpClient
      .get<ApiResponse<UserDto[]>>(ApiEndpoints.Dietitian.Dietitian)
      .pipe(map((resp) => resp.data ?? []));
  }

  requestCollaboration(dietitianId: number): Observable<void> {
    return this.httpClient
      .post<ApiResponse<unknown>>(ApiEndpoints.Dietitian.Collaboration(dietitianId), {})
      .pipe(map(() => undefined));
  }

  getProfileImage(imageId: number): Observable<SafeUrl> {
    if (this.safeUrls.has(imageId)) {
      return of(this.safeUrls.get(imageId)!);
    }

    return this.userService.getProfileImage(imageId).pipe(
      map((blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);

        this.objectUrls.set(imageId, objectUrl);
        this.safeUrls.set(imageId, safeUrl);

        return safeUrl;
      })
    );
  }

  cleanupProfileImages(): void {
    for (const url of this.objectUrls.values()) {
      URL.revokeObjectURL(url);
    }
    this.objectUrls.clear();
    this.safeUrls.clear();
  }

  ngOnDestroy(): void {
    this.cleanupProfileImages();
  }
}
