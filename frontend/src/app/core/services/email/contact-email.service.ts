import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import type {Observable} from 'rxjs';
import {map} from 'rxjs';
import {ApiEndpoints} from '@core/constants/api-endpoints';
import type {ApiResponse} from '@core/models/api-response.model';

@Injectable({providedIn: 'root'})
export class ContactEmailService {
  private readonly httpClient = inject(HttpClient);

  sendContactEmail(recipientUserId: number, subject: string, message: string): Observable<void> {
    return this.httpClient
      .post<ApiResponse<void>>(ApiEndpoints.Email.Contact, {recipientUserId, subject, message})
      .pipe(map(() => undefined));
  }
}
