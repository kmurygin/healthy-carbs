import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, type Observable} from 'rxjs';
import {type ApiResponse} from '../../models/api-response.model';
import {type UserDto} from '../../models/dto/user.dto';
import {type DietaryProfileDto} from '../../models/dto/dietaryprofile.dto';
import {ApiEndpoints} from '@core/constants/api-endpoints';
import {UserService} from '@core/services/user/user.service';
import type {UserMeasurement} from '@core/services/user-measurement/user-measurement.service';
import type {MealPlanDto} from "@core/models/dto/mealplan.dto";

@Injectable({providedIn: 'root'})
export class DietitianService {
  private readonly httpClient = inject(HttpClient);
  private readonly userService = inject(UserService);

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

  getProfileImageUrl(userId: number, cacheKey?: number | string | null): string {
    return this.userService.getProfileImageUrl(userId, cacheKey);
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

  getClientMealPlans(clientId: number): Observable<MealPlanDto[]> {
    return this.httpClient
      .get<ApiResponse<MealPlanDto[]>>(
        `${ApiEndpoints.Dietitian.Base}/clients/${clientId}/meal-plans`
      )
      .pipe(map((resp) => resp.data ?? []));
  }
}
