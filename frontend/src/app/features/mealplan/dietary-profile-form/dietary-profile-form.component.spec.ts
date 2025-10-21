import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';

import {DietaryProfileFormComponent} from './dietary-profile-form.component';

describe('MealplanFormComponent', () => {
  let component: DietaryProfileFormComponent;
  let fixture: ComponentFixture<DietaryProfileFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DietaryProfileFormComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DietaryProfileFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
