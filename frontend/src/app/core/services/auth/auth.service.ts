import {computed, effect, inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {jwtDecode} from 'jwt-decode';
import {LocalStorage} from '../../constants/constants';
import type {UserDto} from '../../models/dto/user.dto';
import {map, tap} from 'rxjs';
import type {RegisterPayload} from "../../models/payloads/register.payload";
import type {ApiResponse} from "../../models/api-response.model";
import type {LoginPayload} from "../../models/payloads/login.payload";
import type {AuthenticationResponse} from "../../models/payloads";
import {ApiEndpoints} from "../../constants/api-endpoints";
import type {JwtClaims} from "./jwtclaims";

@Injectable({providedIn: 'root'})
export class AuthService {

  httpClient = inject(HttpClient);
  router = inject(Router);
  readonly user = computed<string | null>(() => this.claims()?.sub ?? null);
  readonly userId = computed<number | null>(() => this.claims()?.id ?? null);
  readonly userRole = computed<string | null>(() => this.claims()?.role ?? null);
  readonly isLoggedIn = computed<boolean>(() => {
    const jwtClaims = this.claims();
    console.log('jwtClaims: ', jwtClaims);
    if (!jwtClaims?.exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return now < jwtClaims.exp;
  });
  private readonly token = signal<string | null>(localStorage.getItem(LocalStorage.token));
  readonly jwtToken = this.token.asReadonly();
  readonly claims = computed<JwtClaims | null>(() => {
    const jwtToken = this.token();
    console.log('jwtToken: ', jwtToken);
    if (!jwtToken) return null;
    try {
      return jwtDecode<JwtClaims>(jwtToken);
    } catch (e) {
      console.error('Failed to decode JWT token:', e);
      return null;
    }
  });

  constructor() {
    effect(() => {
      const jwtToken = this.token();
      if (jwtToken) localStorage.setItem(LocalStorage.token, jwtToken);
      else localStorage.removeItem(LocalStorage.token);
    });
  }

  register(payload: RegisterPayload) {
    return this.httpClient.post<ApiResponse<UserDto>>(ApiEndpoints.Auth.Register, payload).pipe(
      map(res => {
        if (res.status && res.data) return res;
        throw new Error(res.message ?? 'Registration failed');
      }),
    );
  }

  login(payload: LoginPayload) {
    return this.httpClient.post<ApiResponse<AuthenticationResponse>>(ApiEndpoints.Auth.Login, payload).pipe(
      tap(res => {
        if (!(res.status && res.data?.token)) {
          throw new Error(res.message ?? 'Login failed');
        }
      }),
      map(res => {
        if (res.data !== undefined) {
          this.token.set(res.data.token);
        }
        return res;
      }),
    );
  }

  isTokenExpired(): boolean {
    const jwtClaims = this.claims();
    if (!jwtClaims?.exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return jwtClaims.exp <= now;
  }

  logout(): void {
    this.token.set(null);
    localStorage.removeItem(LocalStorage.token);
    this.router.navigate(['login'], {replaceUrl: true})
      .catch((err: unknown) => {
        console.error('Navigation failed', err);
      });
  }
}
