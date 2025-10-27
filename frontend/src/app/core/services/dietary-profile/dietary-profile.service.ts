import {inject, Injectable} from '@angular/core';
import type {DietaryProfileDto} from "../../models/dto/dietaryprofile.dto";
import type {ApiResponse} from "../../models/api-response.model";
import {HttpClient} from "@angular/common/http";
import {ApiEndpoints} from "../../constants/api-endpoints";
import type {DietaryProfilePayload} from "../../models/payloads/dietaryprofile.payload";
import type {Observable} from "rxjs";
import {map} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class DietaryProfileService {
  private httpClient = inject(HttpClient);

  save(dietaryProfile: DietaryProfilePayload): Observable<DietaryProfileDto | null> {
    return this.httpClient
      .post<ApiResponse<DietaryProfileDto>>(ApiEndpoints.DietaryProfiles.DietaryProfiles, dietaryProfile)
      .pipe(
        map(response => response?.data ?? null)
      );
  }

  getProfile(): Observable<DietaryProfileDto | null> {
    return this.httpClient
      .get<ApiResponse<DietaryProfileDto>>(ApiEndpoints.DietaryProfiles.DietaryProfiles)
      .pipe(
        map(response => response?.data ?? null)
      );
  }
}
