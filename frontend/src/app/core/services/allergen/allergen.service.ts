import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, type Observable} from 'rxjs';
import {ApiEndpoints} from '@core/constants/api-endpoints';
import type {ApiResponse} from '@core/models/api-response.model';
import type {AllergenDto} from '@core/models/dto/allergen.dto';

@Injectable({
  providedIn: 'root'
})
export class AllergenService {
  private readonly httpClient = inject(HttpClient);

  getAll(): Observable<AllergenDto[]> {
    return this.httpClient
      .get<ApiResponse<AllergenDto[]>>(ApiEndpoints.Allergens.Base)
      .pipe(map(resp => resp.data ?? []));
  }

  getById(id: number): Observable<AllergenDto | null> {
    return this.httpClient
      .get<ApiResponse<AllergenDto>>(`${ApiEndpoints.Allergens.Base}/${id}`)
      .pipe(map(resp => resp.data ?? null));
  }

  create(name: string): Observable<AllergenDto> {
    return this.httpClient
      .post<ApiResponse<AllergenDto>>(ApiEndpoints.Allergens.Base, {name})
      .pipe(map(resp => {
        if (!resp.data) {
          throw new Error('Allergen data is missing in response');
        }
        return resp.data;
      }));
  }

  update(id: number, name: string): Observable<AllergenDto> {
    return this.httpClient
      .put<ApiResponse<AllergenDto>>(`${ApiEndpoints.Allergens.Base}/${id}`, {name})
      .pipe(map(resp => {
        if (!resp.data) {
          throw new Error('Allergen data is missing in response');
        }
        return resp.data;
      }));
  }

  delete(id: number): Observable<void> {
    return this.httpClient
      .delete<ApiResponse<void>>(`${ApiEndpoints.Allergens.Base}/${id}`)
      .pipe(map(() => void 0));
  }
}
