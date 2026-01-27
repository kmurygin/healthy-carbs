import {Pipe, type PipeTransform} from '@angular/core';

@Pipe({
  name: 'userStatusBadge',
  standalone: true
})
export class UserStatusBadgePipe implements PipeTransform {
  transform(isActive: boolean): string {
    const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ';
    return isActive
      ? base + 'bg-green-100 text-green-700'
      : base + 'bg-red-100 text-red-700';
  }
}
