import {computed, effect, inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {jwtDecode} from 'jwt-decode';
import {map, tap} from 'rxjs';
import {LocalStorage} from '../../constants/constants';
import {ApiEndpoints} from '../../constants/api-endpoints';
import type {RegisterPayload} from '../../models/payloads/register.payload';
import type {ApiResponse} from '../../models/api-response.model';
import type {LoginPayload} from '../../models/payloads/login.payload';
import type {AuthenticationResponse} from '../../models/payloads';
import type {JwtClaims} from './jwtclaims';

@Injectable({providedIn: 'root'})
export class AuthService {
  readonly isLoggedIn = computed(() => !this.isTokenExpired());
  readonly user = computed(() => this.claims()?.sub ?? null);
  readonly userId = computed(() => this.claims()?.id ?? null);
  readonly userRole = computed(() => this.claims()?.role ?? null);
  private readonly httpClient = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly token = signal<string | null>(localStorage.getItem(LocalStorage.token));
  readonly jwtToken = this.token.asReadonly();
  readonly claims = computed<JwtClaims | null>(() => {
    const jwtToken = this.token();
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
      if (jwtToken) {
        localStorage.setItem(LocalStorage.token, jwtToken);
      } else {
        localStorage.removeItem(LocalStorage.token);
      }
    });
  }

  isTokenExpired(): boolean {
    const claims = this.claims();
    if (!claims?.exp) return true;

    const now = Math.floor(Date.now() / 1000);
    return claims.exp <= now;
  }

  register(payload: RegisterPayload) {
    return this.httpClient.post<ApiResponse<AuthenticationResponse>>(ApiEndpoints.Auth.Register, payload).pipe(
      map(res => {
        if (!res.status) {
          throw new Error(res.message ?? 'Registration failed');
        }
        return res;
      })
    );
  }

  login(payload: LoginPayload) {
    return this.httpClient.post<ApiResponse<AuthenticationResponse>>(ApiEndpoints.Auth.Login, payload).pipe(
      map(res => {
        if (!res.status || !res.data?.token) {
          throw new Error(res.message ?? 'Login failed');
        }
        return res;
      }),
      tap(res => {
        if (res.data?.token) {
          this.token.set(res.data.token);
        }
      })
    );
  }

  logout(): void {
    this.token.set(null);
    this.router.navigate(['login'], {replaceUrl: true})
      .catch((err: unknown) => {
        console.error('Navigation failed', err);
      });
  }
}
