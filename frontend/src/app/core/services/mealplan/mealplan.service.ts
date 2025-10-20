import {inject, Injectable} from '@angular/core';
import type {Observable} from "rxjs";
import {map} from "rxjs";
import type {MealPlanDto} from "../../models/dto/mealplan.dto";
import type {ApiResponse} from "../../models/api-response.model";
import {HttpClient} from "@angular/common/http";
import {ApiEndpoints} from "../../constants/api-endpoints";

@Injectable({
  providedIn: 'root'
})
export class MealPlanService {
  private httpClient = inject(HttpClient);

  generate(): Observable<MealPlanDto> {
    return this.httpClient
      .post<ApiResponse<MealPlanDto>>(`${ApiEndpoints.MealPlan.mealplan}`, null)
      .pipe(map(resp => resp.data!));
  }

  getHistory(): Observable<MealPlanDto[]> {
    return this.httpClient
      .get<ApiResponse<MealPlanDto[]>>(ApiEndpoints.MealPlan.mealplan + `/history`)
      .pipe(map(resp => resp.data ?? []));
  }

  downloadPdf(mealPlanId: number): Observable<Blob> {
    return this.httpClient
      .get(`${ApiEndpoints.MealPlan.mealplan}/${mealPlanId}/download`,
        {responseType: 'blob',});
  }

}
