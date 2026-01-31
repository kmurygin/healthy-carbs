import {Pipe, type PipeTransform} from '@angular/core';
import {UserRole} from '@core/models/enum/user-role.enum';

@Pipe({
  name: 'userRoleBadge',
  standalone: true
})
export class UserRoleBadgePipe implements PipeTransform {
  private readonly badgeStyles: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'bg-amber-100 text-amber-700 ring-amber-500/10',
    [UserRole.DIETITIAN]: 'bg-emerald-100 text-emerald-700 ring-emerald-500/10',
    [UserRole.USER]: 'bg-gray-100 text-gray-700 ring-gray-500/10'
  };

  transform(role: UserRole | string): string {
    const base = 'text-sm rounded-lg border border-gray-200 px-2 py-1 transition-all ';
    const specific = this.badgeStyles[role as UserRole] || 'bg-gray-100 text-gray-700 ring-gray-500/10';
    return base + specific;
  }
}
