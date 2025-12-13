import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import type {IngredientDto} from '../../models/dto/ingredient.dto';
import type {ApiResponse} from '../../models/api-response.model';
import type {Observable} from 'rxjs';
import {catchError, map, of} from 'rxjs';
import {ApiEndpoints} from "@core/constants/api-endpoints";
import type {Page} from "@core/models/page.model";
import type {IngredientSearchParams} from "@core/models/ingredient-search.params";

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

  getAllPage(params: IngredientSearchParams): Observable<Page<IngredientDto> | null> {
    let httpParams = new HttpParams()
      .set('page', params.page)
      .set('size', params.size);

    console.log(`Params: ${params.page} ${params.size}`);

    if (params.name != null) {
      httpParams = httpParams.set('name', params.name);
    }
    if (params.category) {
      httpParams = httpParams.set('category', params.category);
    }
    if (params.onlyMine) {
      httpParams = httpParams.set('onlyMine', 'true');
    }

    console.log(`Params: ${params.name} Category: ${params.category}`);

    return this.httpClient
      .get<ApiResponse<Page<IngredientDto>>>(ApiEndpoints.Ingredients.IngredientsPage, {
        params: httpParams
      })
      .pipe(
        map(resp => resp.data ?? null),
        catchError((err: unknown) => {
          console.error('API Error:', err);
          return of(null);
        })
      );
  }

  getById(id: number): Observable<IngredientDto | null> {
    return this.httpClient
      .get<ApiResponse<IngredientDto>>(`${ApiEndpoints.Ingredients.Ingredients}/${id}`)
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

  update(id: number, ingredient: IngredientDto): Observable<IngredientDto | null> {
    return this.httpClient
      .put<ApiResponse<IngredientDto>>(`${ApiEndpoints.Ingredients.Ingredients}/${id}`, ingredient)
      .pipe(
        map(resp => resp.data ?? null),
        catchError(() => of(null))
      );
  }

  delete(id: number): Observable<null> {
    return this.httpClient.delete<null>(`${ApiEndpoints.Ingredients.Ingredients}/${id}`);
  }

}
