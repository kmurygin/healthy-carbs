import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faBan, faCheck, faCircleInfo, faTrash} from '@fortawesome/free-solid-svg-icons';
import type {UserDto} from '@core/models/dto/user.dto';
import {UserRole} from '@core/models/enum/user-role.enum';
import {UserRoleBadgePipe} from '@shared/pipes/user-role-badge.pipe';
import {ProfileImageUrlPipe} from '@shared/pipes/profile-image-url.pipe';
import {UserStatusBadgePipe} from '@shared/pipes/user-status-badge.pipe';

@Component({
  selector: 'app-user-management-table',
  imports: [CommonModule, FontAwesomeModule, NgOptimizedImage, ProfileImageUrlPipe, UserRoleBadgePipe, UserStatusBadgePipe],
  templateUrl: './user-management-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserManagementTableComponent {
  readonly users = input.required<readonly UserDto[]>();
  readonly assignableRoles = input.required<readonly UserRole[]>();

  readonly viewDetails = output<UserDto>();
  readonly delete = output<UserDto>();
  readonly toggleActive = output<UserDto>();
  readonly changeRole = output<{ user: UserDto; newRole: UserRole }>();

  protected readonly UserRole = UserRole;

  protected readonly icons = {
    info: faCircleInfo,
    trash: faTrash,
    activate: faCheck,
    deactivate: faBan
  };

  onRoleSelect(user: UserDto, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newRole = select.value as UserRole;
    if (user.role !== newRole) {
      this.changeRole.emit({user, newRole});
    }
  }

  getToggleActiveClasses(isActive: boolean): string {
    return isActive
      ? 'hover:bg-orange-50 hover:text-orange-600'
      : 'hover:bg-green-50 hover:text-green-600';
  }
}
