import {describe, expect, it} from 'vitest';

import {ProfileImageUrlPipe} from './profile-image-url.pipe';
import {environment} from '../../../environments/environment';

describe('ProfileImageUrlPipe', () => {
  const pipe = new ProfileImageUrlPipe();

  it('transform_whenProfileImageIdExists_shouldReturnApiUrl', () => {
    const user = {id: 1, firstName: 'Tom', lastName: 'Riddle', profileImageId: 42};
    const result = pipe.transform(user);
    expect(result).toBe(`${environment.apiUrl}/users/1/image?v=42`);
  });

  it('transform_whenProfileImageIdIsNull_shouldReturnAvatarUrl', () => {
    const user = {id: 1, firstName: 'Tom', lastName: 'Riddle', profileImageId: null};
    const result = pipe.transform(user);
    expect(result).toContain('ui-avatars.com');
    expect(result).toContain('Tom');
    expect(result).toContain('Riddle');
  });

  it('transform_whenProfileImageIdIsUndefined_shouldReturnAvatarUrl', () => {
    const user = {id: 1, firstName: 'John', lastName: 'Doe', profileImageId: undefined};
    // @ts-ignore
    const result = pipe.transform(user);
    expect(result).toContain('ui-avatars.com');
    expect(result).toContain('John');
    expect(result).toContain('Doe');
  });

  it('transform_whenSpecialCharactersInName_shouldEncodeUrl', () => {
    const user = {id: 1, firstName: 'José', lastName: 'García', profileImageId: null};
    const result = pipe.transform(user);
    expect(result).toContain(encodeURIComponent('José'));
    expect(result).toContain(encodeURIComponent('García'));
  });
});
