import {ChangeDetectionStrategy, Component, DestroyRef, inject, type OnInit, signal,} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {type SafeUrl} from '@angular/platform-browser';
import {catchError, defaultIfEmpty, finalize, map, mergeMap, reduce, switchMap, tap,} from 'rxjs/operators';
import {EMPTY, from, of} from 'rxjs';
import {DietitianService} from '@core/services/dietitian/dietitian.service';
import {type UserDto} from '@core/models/dto/user.dto';
import {NotificationService} from '@core/services/ui/notification.service';
import {setErrorNotification} from '@shared/utils';
import {ClientCardComponent} from '../client-card/client-card.component';

@Component({
  selector: 'app-client-list',
  imports: [ClientCardComponent],
  templateUrl: './client-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientListComponent implements OnInit {
  readonly clients = signal<readonly UserDto[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly profileImageMap = signal<Map<number, SafeUrl>>(new Map());
  private readonly dietitianService = inject(DietitianService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.loadClients();
  }

  private loadClients(): void {
    const hasProfileImageId = (user: UserDto): user is UserDto &
      { profileImageId: number | string } =>
      user.profileImageId != null;

    this.dietitianService
      .getMyClients()
      .pipe(
        switchMap((users) => {
          this.clients.set(users);

          const withImages = users.filter(hasProfileImageId);
          if (withImages.length === 0) return of(new Map<number, SafeUrl>());

          return from(withImages).pipe(
            mergeMap(
              (user) =>
                this.dietitianService.getProfileImage(user.profileImageId).pipe(
                  map((safeUrl) => [user.id, safeUrl] as const),
                  catchError(() => EMPTY),
                ),
              6,
            ),
            reduce((clientMap, [id, url]) => {
              clientMap.set(id, url);
              return clientMap;
            }, new Map<number, SafeUrl>()),
            defaultIfEmpty(new Map<number, SafeUrl>()),
          );
        }),
        tap((avatarMap) => {
          this.profileImageMap.set(avatarMap)
        }),
        catchError((error: unknown) => {
          this.errorMessage.set('Could not load clients.');
          setErrorNotification(this.notificationService, error, 'Failed to load clients.');
          return of(new Map<number, SafeUrl>());
        }),
        finalize(() => {
          this.isLoading.set(false)
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }
}
