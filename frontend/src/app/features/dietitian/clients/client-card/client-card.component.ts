import {ChangeDetectionStrategy, Component, computed, inject, input,} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {catchError, filter, of, startWith, switchMap} from 'rxjs';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faChartLine, faHistory, faUtensils,} from '@fortawesome/free-solid-svg-icons';
import {DietitianService} from '@core/services/dietitian/dietitian.service';
import {type UserDto} from '@core/models/dto/user.dto';
import {getInitials} from '@features/collaboration/collaboration.utils';

@Component({
  selector: 'app-client-card',
  imports: [CommonModule, RouterLink, FaIconComponent],
  templateUrl: './client-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientCardComponent {
  readonly client = input.required<UserDto>();
  readonly profileImageUrl = input<string | undefined>(undefined);
  readonly faUtensils = faUtensils;
  readonly faHistory = faHistory;
  readonly faChartLine = faChartLine;
  readonly clientId = computed(() => this.client().id);
  private readonly dietitianService = inject(DietitianService);
  readonly dietaryProfile = toSignal(
    toObservable(this.clientId).pipe(
      filter(
        (clientIdentifier): clientIdentifier is number =>
          Number.isFinite(clientIdentifier),
      ),
      switchMap((clientIdentifier) =>
        this.dietitianService.getClientDietaryProfile(clientIdentifier),
      ),
      startWith(null),
      catchError(() => of(null)),
    ),
    {initialValue: null},
  );

  getInitials(user: UserDto): string {
    return getInitials(user.firstName, user.lastName);
  }
}
