import {TestBed} from '@angular/core/testing';
import type {ComponentFixture} from '@angular/core/testing';

import {DietitianIngredientsTableComponent} from './dietitian-ingredients-table.component';

describe('DietitianIngredientsTableComponent', () => {
  let component: DietitianIngredientsTableComponent;
  let fixture: ComponentFixture<DietitianIngredientsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DietitianIngredientsTableComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DietitianIngredientsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
