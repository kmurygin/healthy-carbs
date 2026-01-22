import {inject, Injectable, type OnDestroy} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {DomSanitizer, type SafeUrl} from '@angular/platform-browser';
import {map, type Observable, of} from 'rxjs';
import {type ApiResponse} from '../../models/api-response.model';
import {type UserDto} from '../../models/dto/user.dto';
import {type DietaryProfileDto} from '../../models/dto/dietaryprofile.dto';
import {ApiEndpoints} from '@core/constants/api-endpoints';
import {UserService} from '@core/services/user/user.service';
import type {UserMeasurement} from '@core/services/user-measurement/user-measurement.service';
import type {MealPlanDto} from "@core/models/dto/mealplan.dto";

@Injectable({providedIn: 'root'})
export class DietitianService implements OnDestroy {
  private readonly httpClient = inject(HttpClient);
  private readonly userService = inject(UserService);
  private readonly sanitizer = inject(DomSanitizer);

  private readonly objectUrls = new Map<number, string>();
  private readonly safeUrls = new Map<number, SafeUrl>();

  getAllDietitians(): Observable<UserDto[]> {
    return this.httpClient
      .get<ApiResponse<UserDto[]>>(ApiEndpoints.Dietitian.Base)
      .pipe(map((resp) => resp.data ?? []));
  }

  requestCollaboration(dietitianId: number): Observable<void> {
    return this.httpClient
      .post<ApiResponse<unknown>>(ApiEndpoints.Dietitian.Collaboration(dietitianId), {})
      .pipe(map(() => undefined));
  }

  getProfileImage(imageId: number): Observable<SafeUrl> {
    const cached = this.safeUrls.get(imageId);
    if (cached) {
      return of(cached);
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

  getMyClients(): Observable<UserDto[]> {
    return this.httpClient
      .get<ApiResponse<UserDto[]>>(`${ApiEndpoints.Dietitian.Base}/clients`)
      .pipe(map((resp) => resp.data ?? []));
  }

  getClientMeasurements(clientId: number): Observable<UserMeasurement[]> {
    return this.httpClient
      .get<ApiResponse<UserMeasurement[]>>(
        `${ApiEndpoints.Dietitian.Base}/clients/${clientId}/measurements`
      )
      .pipe(map((resp) => resp.data ?? []));
  }

  getClientDietaryProfile(clientId: number): Observable<DietaryProfileDto | null> {
    return this.httpClient
      .get<ApiResponse<DietaryProfileDto>>(
        `${ApiEndpoints.Dietitian.Base}/clients/${clientId}/dietary-profile`
      )
      .pipe(map((resp) => resp.data ?? null));
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

  getClientMealPlans(clientId: number): Observable<MealPlanDto[]> {
    return this.httpClient
      .get<ApiResponse<MealPlanDto[]>>(
        `${ApiEndpoints.Dietitian.Base}/clients/${clientId}/meal-plans`
      )
      .pipe(map((resp) => resp.data ?? []));
  }
}
