import {type ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';

import {MealPlanCreatorComponent} from './meal-plan-creator.component';

describe('MealPlanCreatorComponent', () => {
  let component: MealPlanCreatorComponent;
  let fixture: ComponentFixture<MealPlanCreatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealPlanCreatorComponent],
      providers: [provideRouter([])]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MealPlanCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
