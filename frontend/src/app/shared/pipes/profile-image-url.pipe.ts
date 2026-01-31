import {Pipe, type PipeTransform} from '@angular/core';
import {environment} from '../../../environments/environment';
import type {UserDto} from '@core/models/dto/user.dto';

type UserImageInfo = Pick<UserDto, 'id' | 'firstName' | 'lastName' | 'profileImageId'>;

@Pipe({
  name: 'profileImageUrl',
  standalone: true
})
export class ProfileImageUrlPipe implements PipeTransform {
  transform(user: UserImageInfo): string {
    if (user.profileImageId != null) {
      return `${environment.apiUrl}/users/${user.id}/image?v=${encodeURIComponent(String(user.profileImageId))}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName)}+${encodeURIComponent(user.lastName)}`;
  }
}
