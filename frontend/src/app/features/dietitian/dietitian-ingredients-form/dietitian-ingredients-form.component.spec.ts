import {TestBed} from '@angular/core/testing';
import type {ComponentFixture} from '@angular/core/testing';

import {DietitianIngredientsFormComponent} from './dietitian-ingredients-form.component';

describe('DietitianIngredientsFormComponent', () => {
  let component: DietitianIngredientsFormComponent;
  let fixture: ComponentFixture<DietitianIngredientsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DietitianIngredientsFormComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DietitianIngredientsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
