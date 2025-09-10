import {ChangeDetectionStrategy, Component, computed, signal,} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PayuPayButtonComponent} from '../payu-pay-button/payu-pay-button.component';
import {Offer} from "../dto/offer";

@Component({
  selector: 'app-offers',
  imports: [CommonModule, PayuPayButtonComponent],
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OffersComponent {
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly offers = computed<Offer[]>(() => {
    return [
      {
        id: '1',
        title: 'Basic Package',
        description: '7-day ready-made meal plan',
        pricePln: 20,
        features: ['shopping list', 'calorie and nutrient breakdown'],
        orderId: this.buildOrderId('1'),
        product: {
          name: '7-day ready-made meal plan',
          unitPrice: 20 * 100,
          quantity: 1
        }
      },
      {
        id: '2',
        title: 'Extended Package',
        description: '7-day personalized meal plan',
        pricePln: 30,
        features: [
          'meal plan created by the dietitian just for you',
          'shopping list',
          'calorie and nutrient breakdown',
          'welcome message from the dietitian with tips'
        ],
        orderId: this.buildOrderId('2'),
        product: {
          name: '7-day personalized meal plan',
          unitPrice: 30 * 100,
          quantity: 1
        }
      },
      {
        id: '3',
        title: 'Premium Package',
        description: '30-day personalized meal plan',
        pricePln: 60,
        features: [
          'shopping list',
          'calorie and nutrient breakdown',
          'welcome message from the dietitian with tips',
          'dietitian support for 30 days'
        ],
        orderId: this.buildOrderId('3'),
        product: {
          name: '30-day personalized meal plan',
          unitPrice: 60 * 100,
          quantity: 1
        }
      },
    ] as const satisfies Offer[];
  });

  private buildOrderId(planId: string): string {
    return btoa(`healthy-carbs-${planId}-${Date.now().toString(36)}`);
  }
}
