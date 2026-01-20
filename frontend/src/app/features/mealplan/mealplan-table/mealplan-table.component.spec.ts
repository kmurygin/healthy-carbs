import {type ComponentFixture, TestBed} from '@angular/core/testing';

import {MealPlanTableComponent} from './mealplan-table.component';

describe('MealplanTableComponent', () => {
  let component: MealPlanTableComponent;
  let fixture: ComponentFixture<MealPlanTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealPlanTableComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MealPlanTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('mealPlans', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
