import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DietitianIngredientsMobileListComponent } from './dietitian-ingredients-mobile-list.component';

describe('DietitianIngredientsMobileListComponent', () => {
  let component: DietitianIngredientsMobileListComponent;
  let fixture: ComponentFixture<DietitianIngredientsMobileListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DietitianIngredientsMobileListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DietitianIngredientsMobileListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
