import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, type Observable} from 'rxjs';
import {ApiEndpoints} from '@core/constants/api-endpoints';
import type {ApiResponse} from '@core/models/api-response.model';
import type {MealPlanTemplateDto} from '@core/models/dto/meal-plan-template.dto';

@Injectable({
  providedIn: 'root'
})
export class MealPlanTemplateService {
  private readonly httpClient = inject(HttpClient);

  getAll(): Observable<MealPlanTemplateDto[]> {
    return this.httpClient
      .get<ApiResponse<MealPlanTemplateDto[]>>(ApiEndpoints.MealPlanTemplates.Base)
      .pipe(map(resp => resp.data ?? []));
  }

  share(templateId: number, clientId: number): Observable<void> {
    return this.httpClient
      .post<ApiResponse<void>>(`${ApiEndpoints.MealPlanTemplates.Base}/${templateId}/share`, {clientId})
      .pipe(map(() => void 0));
  }
}
