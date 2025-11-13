import {ChangeDetectionStrategy, Component, computed, input, output} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {PayuPayButtonComponent} from '../payu-pay-button/payu-pay-button.component';
import {faCheck} from '@fortawesome/free-solid-svg-icons';
import type {Offer} from '../dto/offer';
import type {Product} from '../dto/product';

@Component({
  selector: 'app-offer-card',
  imports: [
    DecimalPipe,
    FaIconComponent,
    PayuPayButtonComponent
  ],
  templateUrl: './offer-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OfferCardComponent {
  readonly offer = input.required<Offer>();
  readonly orderId = input.required<string>();
  readonly isPriority = input<boolean>(false);
  readonly paymentPendingOnAnotherCard = input<boolean>(false);

  readonly description = computed(() => `${this.offer().title} - ${this.offer().description}`);
  readonly paymentClicked = output();
  protected readonly product = computed<Product>(() => {
    const offerItem = this.offer();
    return {
      name: `${offerItem.title} - ${offerItem.description}`,
      unitPrice: offerItem.price * 100,
      quantity: 1,
    };
  });
  protected readonly totalAmount = computed(() => this.offer().price * 100);
  protected readonly faCheck = faCheck;

  protected onPaymentClicked = () => {
    this.paymentClicked.emit();
  };
}
