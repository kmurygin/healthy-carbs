import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';

import {DietitianRecipeTableComponent} from './dietitian-recipe-table.component';

describe('DietitianRecipeTableComponent', () => {
  let component: DietitianRecipeTableComponent;
  let fixture: ComponentFixture<DietitianRecipeTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DietitianRecipeTableComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DietitianRecipeTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
