import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {CommonModule} from '@angular/common';

export type UserRoleVariant = 'AUTHOR' | 'DIETITIAN';

type RoleStyles = Readonly<{
  style: string;
  icon: string;
  label: string;
}>;

@Component({
  selector: 'app-user-role-tag',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (styles(); as styles) {
      <span
        class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5
        text-xs font-medium border border-transparent"
        [class]="styles.style"
      >
        <i class="fa-solid" [class]="styles.icon" aria-hidden="true"></i>
        {{ styles.label }}
      </span>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserRoleTagComponent {
  readonly selectedRole = input.required<UserRoleVariant>();

  private readonly roleStyles: Record<UserRoleVariant, RoleStyles> = {
    AUTHOR: {
      style: 'bg-indigo-100 text-indigo-800',
      icon: 'fa-pen-nib',
      label: 'Author',
    },
    DIETITIAN: {
      style: 'bg-emerald-100 text-emerald-800',
      icon: 'fa-user-doctor',
      label: 'Dietitian',
    }
  };

  readonly styles = computed(() => this.roleStyles[this.selectedRole()]);
}
