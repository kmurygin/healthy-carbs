import {TestBed} from '@angular/core/testing';
import type {ComponentFixture} from '@angular/core/testing';

import {IngredientFilterComponent} from './ingredient-filter.component';

describe('IngredientFilterComponent', () => {
  let component: IngredientFilterComponent;
  let fixture: ComponentFixture<IngredientFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngredientFilterComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(IngredientFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
