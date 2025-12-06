import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import type {IngredientDto} from '../../models/dto/ingredient.dto';
import type {ApiResponse} from '../../models/api-response.model';
import {catchError, map, of} from 'rxjs';
import type {Observable} from 'rxjs';
import {ApiEndpoints} from "@core/constants/api-endpoints";

@Injectable({providedIn: 'root'})
export class IngredientService {
  private httpClient = inject(HttpClient);

  getAll(): Observable<IngredientDto[] | null> {
    return this.httpClient
      .get<ApiResponse<IngredientDto[]>>(ApiEndpoints.Ingredients.Ingredients)
      .pipe(
        map(resp => resp.data ?? null),
        catchError(() => of(null))
      );
  }

  create(ingredient: IngredientDto): Observable<IngredientDto | null> {
    return this.httpClient
      .post<ApiResponse<IngredientDto>>(ApiEndpoints.Ingredients.Ingredients, ingredient)
      .pipe(
        map(resp => resp.data ?? null),
        catchError(() => of(null))
      );
  }

  delete(id: number): Observable<null> {
    return this.httpClient.delete<null>(`${ApiEndpoints.Ingredients.Ingredients}/${id}`);
  }

}
