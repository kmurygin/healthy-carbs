import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import type {Offer} from "@features/payments/dto/offer";
import type {Observable} from "rxjs";
import {map} from "rxjs";
import type {ApiResponse} from "../../models/api-response.model";
import {ApiEndpoints} from "../../constants/api-endpoints";

@Injectable({
  providedIn: 'root'
})
export class OfferService {
  private httpClient = inject(HttpClient);

  getAll(): Observable<Offer[] | null> {
    return this.httpClient
      .get<ApiResponse<Offer[]>>(ApiEndpoints.Offer.Base)
      .pipe(
        map(response => response.data ?? null)
      );
  }
}
