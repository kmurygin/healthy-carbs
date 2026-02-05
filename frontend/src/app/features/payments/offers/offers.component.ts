import {ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal} from '@angular/core';
import type {Offer} from '../dto/offer';
import {ErrorMessageComponent} from "@shared/components/error-message/error-message.component";
import {InfoMessageComponent} from "@shared/components/info-message/info-message.component";
import {OfferService} from "@core/services/offer/offer.service";
import {OfferCardComponent} from "../offer-card/offer-card.component";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

type ViewState = 'LOADING' | 'ERROR' | 'EMPTY' | 'LOADED';

@Component({
  selector: 'app-offers',
  imports: [
    ErrorMessageComponent,
    OfferCardComponent,
    InfoMessageComponent
  ],
  templateUrl: './offers.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OffersComponent {
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly offers = signal<Offer[]>([]);

  readonly pendingOfferId = signal<string | number | null>(null);

  readonly viewState = computed<ViewState>((): ViewState => {
    if (this.isLoading()) {
      return 'LOADING';
    }
    if (this.errorMessage()) {
      return 'ERROR';
    }
    if (this.offers().length === 0) {
      return 'EMPTY';
    }
    return 'LOADED';
  });

  readonly offerCardClasses = computed(() => {
    const baseClasses = 'flex flex-col h-full transition-all duration-300 ease-in-out';
    if (this.pendingOfferId() === null) {
      return baseClasses + ' hover:scale-[1.02] hover:shadow-lg';
    }
    return baseClasses;
  });

  private offerService = inject(OfferService);
  private destroyRef = inject(DestroyRef);

  constructor() {
    this.loadOffers();
  }

  onPaymentInitiated(offer: Offer): void {
    this.pendingOfferId.set(offer.id);
  }

  buildOrderId(planId: string | number): string {
    return btoa(`healthy-carbs-${String(planId)}-${Date.now().toString(36)}`);
  }

  isPaymentPending(offerId: number): boolean {
    return this.pendingOfferId() !== null && this.pendingOfferId() !== offerId;
  }

  private loadOffers(): void {
    this.isLoading.set(true);
    this.offerService.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (offers) => {
          this.offers.set(offers ?? []);
        },
        error: (err: unknown) => {
          let msg = 'Failed to load offers. Please try again later.'
          if (err instanceof Error) {
            msg = err.message || msg;
          }
          this.errorMessage.set(msg);
          this.isLoading.set(false);
        },
        complete: () => {
          this.isLoading.set(false);
        }
      });
  }
}
