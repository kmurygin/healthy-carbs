import {ChangeDetectionStrategy, Component, DestroyRef, inject, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {type SafeUrl} from '@angular/platform-browser';
import {EMPTY, from} from 'rxjs';
import {catchError, filter, finalize, mergeMap, switchMap, tap} from 'rxjs/operators';

import {DietitianService} from '@core/services/dietitian/dietitian.service';
import {type UserDto} from '@core/models/dto/user.dto';
import {ConfirmationService} from '@core/services/ui/confirmation.service';
import {NotificationService} from '@core/services/ui/notification.service';
import {setErrorNotification} from '@shared/utils';
import {generateUiAvatarsUrl} from "@features/collaboration/collaboration.utils";

@Component({
  selector: 'app-dietitian-list',
  imports: [],
  templateUrl: './dietitian-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DietitianListComponent {
  readonly dietitians = signal<readonly UserDto[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly profileImageMap = signal(new Map<number, SafeUrl | string>());
  readonly pendingCollaborationIds = signal<ReadonlySet<number>>(new Set());

  private readonly destroyRef = inject(DestroyRef);
  private readonly dietitianService = inject(DietitianService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly notificationService = inject(NotificationService);

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.dietitianService.cleanupProfileImages();
    });

    this.loadDietitians();
  }

  getProfileImage(userId: number): SafeUrl | string {
    return this.profileImageMap().get(userId) ?? 'assets/default-avatar.png';
  }

  isCollaborationPending(userId: number): boolean {
    return this.pendingCollaborationIds().has(userId);
  }

  onCollaborate(dietitian: UserDto): void {
    if (this.isCollaborationPending(dietitian.id)) return;

    this.confirmationService
      .confirm(
        `Do you want to start collaboration with ${dietitian.firstName} ${dietitian.lastName}?`,
        'Collaboration',
        'info'
      )
      .pipe(
        filter(Boolean),
        tap(() => {
          this.addPending(dietitian.id)
        }),
        switchMap(() => this.dietitianService.requestCollaboration(dietitian.id)),
        finalize(() => {
          this.removePending(dietitian.id)
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.notificationService.info(
            `Successfully started collaboration with ${dietitian.firstName} ${dietitian.lastName}.`
          );
        },
        error: (error: unknown) => {
          setErrorNotification(this.notificationService, error, 'Failed to start collaboration.');
        },
      });
  }

  private loadDietitians(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.dietitianService
      .getAllDietitians()
      .pipe(
        tap((users) => {
          this.dietitians.set(users);
          for (const user of users) {
            this.setProfileImage(user.id, generateUiAvatarsUrl(user.firstName, user.lastName));
          }
        }),
        switchMap((users) =>
          from(users).pipe(
            mergeMap((user) => {
              if (!user.profileImageId) return EMPTY;
              return this.dietitianService.getProfileImage(user.profileImageId).pipe(
                tap((safeUrl) => {
                  this.setProfileImage(user.id, safeUrl)
                }),
                catchError(() => EMPTY)
              );
            }, 6)
          )
        ),
        finalize(() => {
          this.isLoading.set(false)
        }),
        catchError((error: unknown) => {
          this.isLoading.set(false);
          this.errorMessage.set('Could not load dietitians.');
          setErrorNotification(this.notificationService, error, 'Could not load dietitians.');
          return EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  private setProfileImage(userId: number, url: SafeUrl | string): void {
    this.profileImageMap.update((current) => {
      const next = new Map(current);
      next.set(userId, url);
      return next;
    });
  }

  private addPending(userId: number): void {
    this.pendingCollaborationIds.update((set) => {
      const next = new Set(set);
      next.add(userId);
      return next;
    });
  }

  private removePending(userId: number): void {
    this.pendingCollaborationIds.update((set) => {
      const next = new Set(set);
      next.delete(userId);
      return next;
    });
  }
}
