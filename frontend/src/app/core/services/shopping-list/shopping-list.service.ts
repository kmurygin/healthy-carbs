import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import type {Observable} from 'rxjs';
import {map} from 'rxjs';
import type {ShoppingList} from '../../models/dto/shopping-list.dto';
import {ApiEndpoints} from '../../constants/api-endpoints';
import type {ApiResponse} from "../../models/api-response.model";
import type {UpdateShoppingListItemPayload} from "../../models/payloads/updateshoppinglistitem.payload";

@Injectable({
  providedIn: 'root'
})
export class ShoppingListService {
  private readonly httpClient = inject(HttpClient);

  getShoppingList(mealPlanId: number): Observable<ShoppingList> {
    return this.httpClient
      .get<ApiResponse<ShoppingList>>(ApiEndpoints.ShoppingList.Get(mealPlanId))
      .pipe(map(response => response.data!));
  }

  updateItemStatus(mealPlanId: number, payload: UpdateShoppingListItemPayload): Observable<void> {
    return this.httpClient
      .put<void>(ApiEndpoints.ShoppingList.UpdateItem(mealPlanId), payload);
  }

  downloadPdf(mealPlanId: number): Observable<Blob> {
    return this.httpClient
      .get(ApiEndpoints.ShoppingList.Download(mealPlanId), {
        responseType: 'blob',
      });
  }
}
