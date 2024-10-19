import { Injectable } from '@angular/core';
import {ApiResponse} from "../../models/payloads";
import {User} from "../../models/user.model";
import {ApiEndpoints} from "../constants/constants";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private httpClient: HttpClient) {}

  getUserByUsername(username: string) {
    return this.httpClient.get<ApiResponse<User>>(ApiEndpoints.User.GetUserByUsername + username);
  }
}
