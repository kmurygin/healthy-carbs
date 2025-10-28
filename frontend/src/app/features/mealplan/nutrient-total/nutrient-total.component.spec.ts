import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';

import {NutrientTotalComponent} from './nutrient-total.component';

describe('NutrientTotalComponent', () => {
  let component: NutrientTotalComponent;
  let fixture: ComponentFixture<NutrientTotalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NutrientTotalComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(NutrientTotalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
