import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, type Observable} from 'rxjs';
import {ApiEndpoints} from '@core/constants/api-endpoints';
import type {ApiResponse} from '@core/models/api-response.model';
import type {DietTypeDto} from '@core/models/dto/diet-type.dto';

@Injectable({
  providedIn: 'root'
})
export class DietTypeService {
  private readonly httpClient = inject(HttpClient);

  getAll(): Observable<DietTypeDto[]> {
    return this.httpClient
      .get<ApiResponse<DietTypeDto[]>>(ApiEndpoints.DietTypes.Base)
      .pipe(map(resp => resp.data ?? []));
  }

  create(payload: { name: string; compatibilityLevel: number }): Observable<DietTypeDto> {
    return this.httpClient
      .post<ApiResponse<DietTypeDto>>(ApiEndpoints.DietTypes.Base, payload)
      .pipe(map(resp => {
        if (!resp.data) {
          throw new Error('DietType data is missing in response');
        }
        return resp.data;
      }));
  }

  delete(id: number): Observable<void> {
    return this.httpClient
      .delete<ApiResponse<void>>(`${ApiEndpoints.DietTypes.Base}/${id}`)
      .pipe(map(() => void 0));
  }
}
