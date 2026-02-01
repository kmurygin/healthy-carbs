import {describe, expect, it} from 'vitest';

import {UserRoleBadgePipe} from './user-role-badge.pipe';
import {UserRole} from '@core/models/enum/user-role.enum';

describe('UserRoleBadgePipe', () => {
  const pipe = new UserRoleBadgePipe();

  it('transform_whenRoleIsAdmin_shouldReturnAmberClasses', () => {
    const result = pipe.transform(UserRole.ADMIN);
    expect(result).toContain('bg-amber-100');
    expect(result).toContain('text-amber-700');
  });

  it('transform_whenRoleIsDietitian_shouldReturnEmeraldClasses', () => {
    const result = pipe.transform(UserRole.DIETITIAN);
    expect(result).toContain('bg-emerald-100');
    expect(result).toContain('text-emerald-700');
  });

  it('transform_whenRoleIsUser_shouldReturnGrayClasses', () => {
    const result = pipe.transform(UserRole.USER);
    expect(result).toContain('bg-gray-100');
    expect(result).toContain('text-gray-700');
  });

  it('transform_whenRoleIsUnknown_shouldReturnDefaultGrayClasses', () => {
    const result = pipe.transform('UNKNOWN');
    expect(result).toContain('bg-gray-100');
    expect(result).toContain('text-gray-700');
  });

  it('transform_whenCalled_shouldIncludeBaseClasses', () => {
    const result = pipe.transform(UserRole.ADMIN);
    expect(result).toContain('text-sm');
    expect(result).toContain('rounded-lg');
    expect(result).toContain('border');
  });
});
