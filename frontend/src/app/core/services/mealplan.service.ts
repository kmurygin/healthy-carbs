import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {UserProfilePayload} from "../models/payloads";
import {ApiEndpoints} from "../constants/constants";

@Injectable({
  providedIn: 'root'
})
export class MealplanService {
  private httpClient = inject(HttpClient);

  sendUserProfile(userProfilePayload: UserProfilePayload) {
    return this.httpClient.post<string>(ApiEndpoints.MealPlan.userprofile, userProfilePayload);
  }

  // getMealPlan() {
  //   return http
  // }
}

