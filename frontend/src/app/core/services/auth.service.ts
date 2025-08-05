import {Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ApiEndpoints, LocalStorage} from '../constants/constants';
import {User} from '../models/user.model';
import {ApiResponse, LoginPayload, RegisterPayload} from '../models/payloads';
import {Router} from '@angular/router';
import {map} from 'rxjs';
import {jwtDecode} from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLoggedIn = signal<boolean>(false);
  user = signal<User | undefined>(undefined);

  constructor(private httpClient: HttpClient, private router: Router) {
    this.checkTokenOnInit();
  }

  register(registerPayload: RegisterPayload) {
    return this.httpClient.post<ApiResponse<User>>(ApiEndpoints.Auth.Register, registerPayload);
  }

  login(loginPayload: LoginPayload) {
    return this.httpClient.post<ApiResponse<User>>(ApiEndpoints.Auth.Login, loginPayload).pipe(
      map((response) => {
        if (response.token) {
          localStorage.setItem(LocalStorage.token, response.token);
          this.isLoggedIn.set(true);
          const userFromToken = this.getUserFromToken();
          this.user.set(userFromToken?.username);
        } else if (response.error) {
          this.isLoggedIn.set(false);
          console.log(response.error);
        }
        return response;
      })
    );
  }

  isTokenExpired(): boolean {
    const token = this.getUserToken();
    if (!token) {
      return true;
    }
    const decodedToken: any = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);

    console.log(decodedToken.exp < currentTime)

    return decodedToken.exp < currentTime;
  }

  getUserToken() {
    return localStorage.getItem(LocalStorage.token);
  }

  getUserFromToken() {
    const token = this.getUserToken();
    if (token && !this.isTokenExpired()) {
      const decodedToken: any = jwtDecode(token);
      return {
        username: decodedToken.sub,
      };
    }
    return null;
  }

  logout() {
    localStorage.removeItem(LocalStorage.token);
    console.log("dddd");
    this.isLoggedIn.set(false);
    this.user.set(undefined);
    this.router.navigate(['login']);
    window.location.reload();
  }

  private checkTokenOnInit() {
    const userFromToken = this.getUserFromToken();
    if (userFromToken) {
      this.isLoggedIn.set(true);
      this.user.set(userFromToken.username);
    }
  }
}
