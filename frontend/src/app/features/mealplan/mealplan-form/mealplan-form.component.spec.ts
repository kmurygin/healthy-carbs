import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MealplanFormComponent} from './mealplan-form.component';

describe('MealplanFormComponent', () => {
  let component: MealplanFormComponent;
  let fixture: ComponentFixture<MealplanFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealplanFormComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MealplanFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
