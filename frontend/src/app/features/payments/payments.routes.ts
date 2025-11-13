import type {Routes} from '@angular/router';
import {authGuard} from '@core/guards/auth.guard';

export const PAYMENT_ROUTES: Routes = [
  {
    path: '',
    canMatch: [authGuard],
    loadComponent: () =>
      import ('./payu-pay-button/payu-pay-button.component').then((m) => m.PayuPayButtonComponent),
  },
  {
    path: 'offers',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./offers/offers.component').then((m) => m.OffersComponent),
  },
  {
    path: 'result',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./payment-result/payment-result.component').then(
        (m) => m.PaymentResultComponent
      ),
  },
];
