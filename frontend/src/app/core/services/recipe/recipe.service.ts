import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import type {ApiResponse} from "../../models/api-response.model";
import type {RecipeDto} from "../../models/dto/recipe.dto";
import {ApiEndpoints} from "../../constants/api-endpoints";
import type {Observable} from "rxjs";
import {map} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private readonly httpClient = inject(HttpClient);

  getAll(): Observable<readonly RecipeDto[]> {
    return this.httpClient
      .get<ApiResponse<RecipeDto[]>>(ApiEndpoints.Recipes.Recipes)
      .pipe(
        map((resp) => resp.data ?? [])
      );
  }

  getById(id: number): Observable<RecipeDto | null> {
    return this.httpClient
      .get<ApiResponse<RecipeDto>>(`${ApiEndpoints.Recipes.Recipes}/${id}`)
      .pipe(map(resp => resp.data ?? null));
  }
}
