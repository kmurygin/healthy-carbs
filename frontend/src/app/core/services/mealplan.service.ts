import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import { UserProfilePayload } from "../../models/payloads";
import {ApiEndpoints} from "../constants/constants";

@Injectable({
  providedIn: 'root'
})
export class MealplanService {

  constructor(private httpClient: HttpClient) {}

  sendUserProfile(userProfilePayload: UserProfilePayload) {
    return this.httpClient.post<string>(ApiEndpoints.MealPlan.userprofile, userProfilePayload);
  }

  // getMealPlan() {
  //   return http
  // }
}
