import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import type {Observable} from 'rxjs';
import {catchError, map, of} from 'rxjs';
import type {ApiResponse} from '../../models/api-response.model';
import {ApiEndpoints} from "../../constants/api-endpoints";

export interface MeasurementPayload {
  weight: number;
  waistCircumference?: number;
  hipCircumference?: number;
  chestCircumference?: number;
  armCircumference?: number;
  thighCircumference?: number;
  calfCircumference?: number;
}

export interface UserMeasurement {
  date: string;
  weight: number;
  waistCircumference?: number;
  hipCircumference?: number;
  chestCircumference?: number;
  armCircumference?: number;
  thighCircumference?: number;
  calfCircumference?: number;
}

export interface CanAddMeasurementItem {
  allowed: boolean;
  remainingMs: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserMeasurementService {
  private readonly httpClient = inject(HttpClient);

  addMeasurement(payload: MeasurementPayload): Observable<ApiResponse<void>> {
    return this.httpClient
      .post<ApiResponse<void>>(ApiEndpoints.Measurements.Measurements, payload);
  }

  getAllHistory(): Observable<UserMeasurement[] | null> {
    return this.httpClient
      .get<ApiResponse<UserMeasurement[]>>(ApiEndpoints.Measurements.Measurements)
      .pipe(
        map(resp => resp.data ?? null),
        catchError(() => of(null))
      );
  }

  canAddMeasurement(history: UserMeasurement[]): CanAddMeasurementItem {
    if (history.length === 0) return {allowed: true, remainingMs: 0};

    const latestTime = Math.max(...history.map(item => new Date(item.date).getTime()));
    const timeSince = Date.now() - latestTime;
    const limit = 24 * 60 * 60 * 1000;

    return {
      allowed: timeSince >= limit,
      remainingMs: Math.max(0, limit - timeSince)
    };
  }
}
