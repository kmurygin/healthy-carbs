import {inject, Injectable} from '@angular/core';
import type {Observable} from "rxjs";
import {map} from "rxjs";
import type {MealPlanDto} from "../../models/dto/mealplan.dto";
import type {ApiResponse} from "../../models/api-response.model";
import {HttpClient} from "@angular/common/http";
import {ApiEndpoints} from "../../constants/api-endpoints";
import type {CreateMealPlanRequest} from "@features/dietitian/meal-plan-creator/meal-plan-creator.util";

@Injectable({
  providedIn: 'root'
})
export class MealPlanService {
  private httpClient = inject(HttpClient);

  generate(): Observable<MealPlanDto> {
    return this.httpClient
      .post<ApiResponse<MealPlanDto>>(ApiEndpoints.MealPlan.Base, null)
      .pipe(map(resp => {
        if (!resp.data) {
          throw new Error('Failed to generate meal plan');
        }
        return resp.data;
      }));
  }

  getHistory(): Observable<MealPlanDto[]> {
    return this.httpClient
      .get<ApiResponse<MealPlanDto[]>>(ApiEndpoints.MealPlan.Base + `/history`)
      .pipe(map(resp => resp.data ?? []));
  }

  downloadPdf(mealPlanId: number): Observable<Blob> {
    return this.httpClient
      .get(`${ApiEndpoints.MealPlan.Base}/${mealPlanId}/download`,
        {responseType: 'blob',});
  }

  getById(mealPlanId: number): Observable<MealPlanDto> {
    return this.httpClient
      .get<ApiResponse<MealPlanDto>>(
        `${ApiEndpoints.MealPlan.Base}/${mealPlanId}`,
      )
      .pipe(
        map((resp) => {
          if (!resp.data) {
            throw new Error(`Meal plan with id ${mealPlanId} not found.`);
          }
          return resp.data;
        }),
      );
  }

  createManual(request: CreateMealPlanRequest): Observable<MealPlanDto> {
    return this.httpClient
      .post<ApiResponse<MealPlanDto>>(`${ApiEndpoints.MealPlan.Base}/manual`, request)
      .pipe(map(resp => {
        if (!resp.data) throw new Error('Failed to create meal plan');
        return resp.data;
      }));
  }

}
