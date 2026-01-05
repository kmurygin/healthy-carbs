import {type ComponentFixture, TestBed} from '@angular/core/testing';

import {MealPlanCreatorHeaderComponent} from './meal-plan-creator-header.component';

describe('MealPlanCreatorHeaderComponent', () => {
  let component: MealPlanCreatorHeaderComponent;
  let fixture: ComponentFixture<MealPlanCreatorHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealPlanCreatorHeaderComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MealPlanCreatorHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
