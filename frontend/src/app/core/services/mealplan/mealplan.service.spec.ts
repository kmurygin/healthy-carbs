import {TestBed} from '@angular/core/testing';

import {MealPlanService} from './mealplan.service';

describe('MealplanService', () => {
  let service: MealPlanService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MealPlanService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
