import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PayuPayButtonComponent} from './payu-pay-button.component';

describe('PayuPayButtonComponent', () => {
  let component: PayuPayButtonComponent;
  let fixture: ComponentFixture<PayuPayButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayuPayButtonComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PayuPayButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
