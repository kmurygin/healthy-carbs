import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';

import {DietitianIngredientsComponent} from './dietitian-ingredients.component';

describe('DietitianIngredientsComponent', () => {
  let component: DietitianIngredientsComponent;
  let fixture: ComponentFixture<DietitianIngredientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DietitianIngredientsComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DietitianIngredientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
