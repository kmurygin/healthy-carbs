import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {catchError, filter, map, of, startWith, switchMap} from 'rxjs';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faArrowLeft, faExclamationCircle, faSpinner, faUsers} from '@fortawesome/free-solid-svg-icons';
import {UserService} from '@core/services/user/user.service';
import {AuthService} from '@core/services/auth/auth.service';
import type {UserDto} from '@core/models/dto/user.dto';
import {UserRole} from '@core/models/enum/user-role.enum';
import {AbstractManagementComponent} from '@shared/components/abstract-management/abstract-management.component';
import {UserManagementTableComponent} from '../user-management-table/user-management-table.component';
import {UserManagementMobileListComponent} from '../user-management-mobile-list/user-management-mobile-list.component';
import {RoleFilter, StatusFilter, UserFilterComponent, type UserFilters} from '../user-filter/user-filter.component';
import {UserDetailsModalComponent} from '../user-details-modal/user-details-modal.component';

@Component({
  selector: 'app-user-management',
  imports: [
    CommonModule,
    FontAwesomeModule,
    UserManagementTableComponent,
    UserManagementMobileListComponent,
    UserFilterComponent,
    UserDetailsModalComponent
  ],
  templateUrl: './user-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserManagementComponent extends AbstractManagementComponent<UserDto> {
  readonly roles = Object.values(UserRole);
  readonly assignableRoles = Object.values(UserRole).filter(role => role !== UserRole.ADMIN);

  readonly selectedUser = signal<UserDto | null>(null);
  readonly filters = signal<UserFilters>({query: '', role: RoleFilter.ALL, status: StatusFilter.ALL});
  protected readonly icons = {
    back: faArrowLeft,
    spinner: faSpinner,
    users: faUsers,
    warn: faExclamationCircle
  };
  private readonly refreshTrigger = signal(0);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly currentUserId = this.authService.userId;

  private readonly state = toSignal(
    toObservable(this.refreshTrigger).pipe(
      switchMap(() => this.userService.getAllUsers().pipe(
        map(users => ({users, loading: false, error: null})),
        catchError((err: unknown) => {
          console.error('User load error:', err);
          return of({
            users: [] as UserDto[],
            loading: false,
            error: 'Failed to load users. Please try again later.'
          });
        })
      )),
      startWith({users: [] as UserDto[], loading: true, error: null})
    ),
    {initialValue: {users: [] as UserDto[], loading: true, error: null}}
  );
  readonly isDataLoading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  private readonly allUsers = computed(() => this.state().users);
  readonly filteredUsers = computed(() => {
    const {query, role, status} = this.filters();
    const allUsers = this.allUsers();
    const searchQuery = query.toLowerCase();

    return allUsers.filter(user => {
      const matchesQuery = !searchQuery ||
        user.username.toLowerCase().includes(searchQuery) ||
        user.firstName.toLowerCase().includes(searchQuery) ||
        user.lastName.toLowerCase().includes(searchQuery) ||
        user.email.toLowerCase().includes(searchQuery);

      const matchesRole = role === RoleFilter.ALL || user.role === role;

      const matchesStatus = status === StatusFilter.ALL ||
        (status === StatusFilter.ACTIVE && user.isActive) ||
        (status === StatusFilter.INACTIVE && !user.isActive);

      return matchesQuery && matchesRole && matchesStatus;
    });
  });
  readonly totalElements = computed(() => this.allUsers().length);

  override reloadData(): void {
    this.refreshTrigger.update(n => n + 1);
  }

  override deleteItem(id: number): void {
    const user = this.allUsers().find(u => u.id === id);
    if (!user) {
      return;
    }

    this.confirmationService.confirm({
      title: 'Delete User',
      message: `Are you sure you want to delete user "${user.username}"? This action cannot be undone.`,
      type: 'danger'
    }).pipe(
      filter(confirmed => confirmed),
      switchMap(() => this.userService.deleteUser(user.id))
    ).subscribe({
      next: () => {
        this.notificationService.success(`User "${user.username}" deleted successfully`);
        this.reloadData();
      },
      error: () => {
        this.notificationService.error('Failed to delete user.');
      }
    });
  }

  changeUserRole(event: { user: UserDto; newRole: UserRole }): void {
    const {user, newRole} = event;

    this.confirmationService.confirm({
      title: 'Change User Role',
      message: `Change "${user.username}" from ${user.role} to ${newRole}?`,
      type: 'info'
    }).pipe(
      filter(confirmed => confirmed),
      switchMap(() => this.userService.changeUserRole(user.id, newRole))
    ).subscribe({
      next: () => {
        this.notificationService.success(`Role updated for ${user.username}.`);
        this.reloadData();
      },
      error: () => {
        this.notificationService.error('Failed to change user role.');
      }
    });
  }

  toggleUserActive(user: UserDto): void {
    if (user.id === this.currentUserId() && user.isActive) {
      this.notificationService.error('You cannot deactivate your own account.');
      return;
    }

    this.confirmationService.confirm({
      title: user.isActive ? 'Deactivate Account' : 'Activate Account',
      message: `Are you sure you want to ${user.isActive ? 'deactivate' : 'activate'} "${user.username}"?`,
      type: user.isActive ? 'danger' : 'info'
    }).pipe(
      filter(confirmed => confirmed),
      switchMap(() => this.userService.toggleUserActiveStatus(user.id))
    ).subscribe({
      next: (updatedUser) => {
        this.notificationService.success(`Account ${updatedUser.isActive ? 'activated' : 'deactivated'}.`);
        this.reloadData();
      },
      error: () => {
        this.notificationService.error('Failed to update user status.');
      }
    });
  }

  handleFiltersChange(filters: UserFilters): void {
    this.filters.set(filters);
  }

  viewUserDetails(user: UserDto): void {
    this.selectedUser.set(user);
  }

  closeUserDetails(): void {
    this.selectedUser.set(null);
  }
}
