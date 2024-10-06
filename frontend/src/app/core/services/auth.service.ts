import {inject, Injectable, signal} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ApiResponse, LoginPayload, RegisterPayload} from "../../models/payloads";
import {ApiEndpoints, LocalStorage} from "../constants/constants";
import {User} from "../../models/user.model";
import {map} from "rxjs";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  isLoggedIn = signal<boolean>(false);
  router = inject(Router);

  constructor(private httpClient: HttpClient) {
    if (this.getUserToken()) {
      this.isLoggedIn.update(() => true);
    }
  }

  register(registerPayload: RegisterPayload) {
    return this.httpClient.post<ApiResponse<User>>(ApiEndpoints.Auth.Register, registerPayload);
  }

  login(loginPayload: LoginPayload){
    return this.httpClient
      .post<ApiResponse<User>>(ApiEndpoints.Auth.Login, loginPayload)
      .pipe(map((response) => {
        if (response.token){
          localStorage.setItem(LocalStorage.token, response.token);
          this.isLoggedIn.update(() => true);
        }
        return response;
      }));
  }

  me(){
    return this.httpClient.get<ApiResponse<User>>(ApiEndpoints.Auth.Me);
  }

  getUserToken() {
    return localStorage.getItem(LocalStorage.token);
  }

  logout(){
    localStorage.removeItem(LocalStorage.token);
    this.isLoggedIn.update(() => false);
    this.router.navigate(['login']);
  }
}
