import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import type {ApiResponse} from "../../models/api-response.model";
import type {RecipeDto} from "../../models/dto/recipe.dto";
import {ApiEndpoints} from "../../constants/api-endpoints";
import type {Observable} from "rxjs";
import {catchError, map, of} from "rxjs";
import type {Page} from "../../models/page.model";
import type {RecipeSearchParams} from "../../models/recipe-search.params";

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private readonly httpClient = inject(HttpClient);

  getAll(params: RecipeSearchParams): Observable<Page<RecipeDto>> {
    let httpParams: HttpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('size', params.size.toString());

    if (params.name) {
      httpParams = httpParams.set('name', params.name);
    }
    if (params.ingredient) {
      httpParams = httpParams.set('ingredient', params.ingredient);
    }
    if (params.diet) {
      httpParams = httpParams.set('diet', params.diet);
    }
    if (params.meal) {
      httpParams = httpParams.set('meal', params.meal);
    }

    return this.httpClient
      .get<ApiResponse<Page<RecipeDto>>>(ApiEndpoints.Recipes.Recipes, {
        params: httpParams
      })
      .pipe(
        map((resp: ApiResponse<Page<RecipeDto>>): Page<RecipeDto> => resp.data ?? this.emptyPage(params.size, params.page)),
        catchError(() => of(this.emptyPage(params.size, params.page)))
      );
  }

  getById(id: number): Observable<RecipeDto | null> {
    return this.httpClient
      .get<ApiResponse<RecipeDto>>(`${ApiEndpoints.Recipes.Recipes}/${id}`)
      .pipe(
        map(resp => resp.data ?? null),
        catchError(() => of(null))
      );
  }

  private emptyPage(size: number, page: number): Page<RecipeDto> {
    return {
      content: [],
      totalPages: 0,
      totalElements: 0,
      size: size,
      number: page,
      first: true,
      last: true,
      empty: true,
    }
  }
}
