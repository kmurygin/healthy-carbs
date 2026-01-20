import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';

import {PaymentResultComponent} from './payment-result.component';

describe('PaymentResultComponent', () => {
  let component: PaymentResultComponent;
  let fixture: ComponentFixture<PaymentResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentResultComponent],
      providers: [provideRouter([])]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PaymentResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
