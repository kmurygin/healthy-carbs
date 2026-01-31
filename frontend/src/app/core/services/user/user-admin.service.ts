import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, type Observable} from 'rxjs';
import {ApiEndpoints} from '@core/constants/api-endpoints';
import type {ApiResponse} from '@core/models/api-response.model';
import type {UserDto} from '@core/models/dto/user.dto';
import type {UserRole} from '@core/models/enum/user-role.enum';

@Injectable({
  providedIn: 'root'
})
export class UserAdminService {
  private readonly httpClient = inject(HttpClient);

  getAllUsers(): Observable<UserDto[]> {
    return this.httpClient
      .get<ApiResponse<UserDto[]>>(ApiEndpoints.Admin.Users.GetAll)
      .pipe(map((resp) => resp.data ?? []));
  }

  deleteUser(id: number): Observable<void> {
    return this.httpClient
      .delete<ApiResponse<void>>(`${ApiEndpoints.User.Base}${id}`)
      .pipe(map(() => void 0));
  }

  changeUserRole(id: number, role: UserRole): Observable<UserDto> {
    return this.httpClient
      .patch<ApiResponse<UserDto>>(`${ApiEndpoints.Admin.Users.Base}${id}/role`, {role})
      .pipe(map((resp) => {
        if (!resp.data) {
          throw new Error('User data is missing in response');
        }
        return resp.data;
      }));
  }

  toggleUserActiveStatus(id: number): Observable<UserDto> {
    return this.httpClient
      .patch<ApiResponse<UserDto>>(`${ApiEndpoints.Admin.Users.Base}${id}/toggle-active`, {})
      .pipe(map((resp) => {
        if (!resp.data) {
          throw new Error('User data is missing in response');
        }
        return resp.data;
      }));
  }
}
