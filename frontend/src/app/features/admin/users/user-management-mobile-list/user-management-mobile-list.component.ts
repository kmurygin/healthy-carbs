import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faBan, faCheck, faCircleInfo, faTrash} from '@fortawesome/free-solid-svg-icons';
import type {UserDto} from '@core/models/dto/user.dto';
import {ProfileImageUrlPipe} from '@shared/pipes/profile-image-url.pipe';
import {UserRoleBadgePipe} from '@shared/pipes/user-role-badge.pipe';
import {UserStatusBadgePipe} from '@shared/pipes/user-status-badge.pipe';

@Component({
  selector: 'app-user-management-mobile-list',
  imports: [CommonModule, FontAwesomeModule, NgOptimizedImage, ProfileImageUrlPipe, UserRoleBadgePipe, UserStatusBadgePipe],
  templateUrl: './user-management-mobile-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserManagementMobileListComponent {
  readonly users = input.required<readonly UserDto[]>();

  readonly viewDetails = output<UserDto>();
  readonly delete = output<UserDto>();
  readonly toggleActive = output<UserDto>();

  protected readonly icons = {
    info: faCircleInfo,
    trash: faTrash,
    activate: faCheck,
    deactivate: faBan
  };
}
