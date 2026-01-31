import {ChangeDetectionStrategy, Component, computed, input, output} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import type {UserDto} from '@core/models/dto/user.dto';
import {ProfileImageUrlPipe} from '@shared/pipes/profile-image-url.pipe';
import {UserStatusBadgePipe} from '@shared/pipes/user-status-badge.pipe';

interface DetailField {
  label: string;
  value: string | null;
}

@Component({
  selector: 'app-user-details-modal',
  imports: [CommonModule, NgOptimizedImage, ProfileImageUrlPipe, UserStatusBadgePipe],
  templateUrl: './user-details-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDetailsModalComponent {
  readonly user = input.required<UserDto>();

  readonly closeModal = output();

  readonly detailFields = computed<DetailField[]>(() => {
    const user = this.user();
    return [
      {label: 'Email', value: user.email},
      {label: 'Role', value: user.role},
      {label: 'Account Created', value: user.createdAt ? new Date(user.createdAt).toLocaleString() : null},
      {label: 'Last logged at', value: user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : null}
    ];
  });

  onBackdropClick(): void {
    this.closeModal.emit();
  }

  onCloseClick(): void {
    this.closeModal.emit();
  }
}
