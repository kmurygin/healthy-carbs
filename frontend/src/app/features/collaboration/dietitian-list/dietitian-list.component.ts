import {ChangeDetectionStrategy, Component, DestroyRef, inject, signal} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {EMPTY, forkJoin, of} from 'rxjs';
import {catchError, filter, finalize, switchMap, take, tap} from 'rxjs/operators';

import {DietitianService} from '@core/services/dietitian/dietitian.service';
import {type UserDto} from '@core/models/dto/user.dto';
import {ConfirmationService} from '@core/services/ui/confirmation.service';
import {NotificationService} from '@core/services/ui/notification.service';
import {PayuService} from '@core/services/payu/payu.service';
import {setErrorNotification} from '@shared/utils';
import {generateUiAvatarsUrl} from "@features/collaboration/collaboration.utils";
import {ContactFormComponent} from '@shared/components/contact-form/contact-form.component';
import type {InitPaymentRequest} from '@features/payments/dto/init-payment-request';
import {saveLastLocalOrderId, validatePayuRedirectUrl} from '@features/payments/utils';

@Component({
  selector: 'app-dietitian-list',
  imports: [NgOptimizedImage, ContactFormComponent],
  templateUrl: './dietitian-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DietitianListComponent {
  readonly dietitians = signal<readonly UserDto[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly profileImageMap = signal(new Map<number, string>());
  readonly pendingCollaborationIds = signal<ReadonlySet<number>>(new Set());
  readonly activeCollaborationIds = signal<ReadonlySet<number>>(new Set());
  readonly contactRecipient = signal<UserDto | null>(null);

  private readonly destroyRef = inject(DestroyRef);
  private readonly dietitianService = inject(DietitianService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly notificationService = inject(NotificationService);
  private readonly payuService = inject(PayuService);

  constructor() {
    this.loadDietitians();
  }

  getProfileImage(userId: number): string {
    return this.profileImageMap().get(userId) ?? 'assets/default-avatar.png';
  }

  isCollaborationPending(userId: number): boolean {
    return this.pendingCollaborationIds().has(userId);
  }

  hasActiveCollaboration(userId: number): boolean {
    return this.activeCollaborationIds().has(userId);
  }

  onContact(dietitian: UserDto): void {
    this.contactRecipient.set(dietitian);
  }

  onContactClosed(): void {
    this.contactRecipient.set(null);
  }

  onCollaborate(dietitian: UserDto): void {
    if (this.isCollaborationPending(dietitian.id)) return;

    this.addPending(dietitian.id);

    const localOrderId = btoa(
      `healthy-carbs-collab-${dietitian.id}-${Date.now().toString(36)}`
    );
    const payload: InitPaymentRequest = {
      localOrderId,
      description: `Collaboration with ${dietitian.firstName} ${dietitian.lastName}`,
      totalAmount: 5000,
      products: [{name: 'Dietitian Collaboration', unitPrice: 5000, quantity: 1}],
    };

    this.payuService.createPayment(payload).pipe(take(1)).subscribe({
      next: (response) => {
        saveLastLocalOrderId(localOrderId);
        if (typeof window !== 'undefined') {
          try {
            validatePayuRedirectUrl(response.redirectUri);
            window.location.assign(response.redirectUri);
          } catch {
            this.removePending(dietitian.id);
            this.notificationService.error('Failed to redirect to payment page.');
          }
        }
      },
      error: (error: unknown) => {
        this.removePending(dietitian.id);
        setErrorNotification(this.notificationService, error, 'Failed to start payment.');
      },
    });
  }

  onCancelCollaboration(dietitian: UserDto): void {
    if (this.isCollaborationPending(dietitian.id)) return;

    this.confirmationService
      .confirm({
        message: `Do you want to cancel collaboration with ${dietitian.firstName} ${dietitian.lastName}?`,
        title: 'Cancel Collaboration',
        type: 'danger'
      })
      .pipe(
        filter(Boolean),
        tap(() => {
          this.addPending(dietitian.id)
        }),
        switchMap(() => this.dietitianService.cancelCollaboration(dietitian.id)),
        finalize(() => {
          this.removePending(dietitian.id)
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.removeActiveCollaboration(dietitian.id);
          this.notificationService.info(
            `Collaboration with ${dietitian.firstName} ${dietitian.lastName} has been cancelled.`
          );
        },
        error: (error: unknown) => {
          setErrorNotification(this.notificationService, error, 'Failed to cancel collaboration.');
        },
      });
  }

  private loadDietitians(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      dietitians: this.dietitianService.getAllDietitians(),
      collaborations: this.dietitianService.getMyCollaborations().pipe(catchError(() => of([]))),
    })
      .pipe(
        tap(({dietitians: users, collaborations}) => {
          this.dietitians.set(users);
          this.activeCollaborationIds.set(new Set(collaborations));
          for (const user of users) {
            this.setProfileImage(user.id, generateUiAvatarsUrl(user.firstName, user.lastName));
            if (user.profileImageId) {
              this.setProfileImage(
                user.id,
                this.dietitianService.getProfileImageUrl(user.id, user.profileImageId)
              );
            }
          }
        }),
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

  private setProfileImage(userId: number, url: string): void {
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

  private removeActiveCollaboration(userId: number): void {
    this.activeCollaborationIds.update((set) => {
      const next = new Set(set);
      next.delete(userId);
      return next;
    });
  }
}
