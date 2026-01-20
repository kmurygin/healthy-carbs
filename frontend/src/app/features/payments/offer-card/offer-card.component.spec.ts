import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';

import {OfferCardComponent} from './offer-card.component';

describe('OfferCardComponent', () => {
  let component: OfferCardComponent;
  let fixture: ComponentFixture<OfferCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfferCardComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(OfferCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('offer', {
      id: '1',
      title: 'Test Offer',
      description: 'Test Description',
      price: 100,
      features: []
    });
    fixture.componentRef.setInput('orderId', '123');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
