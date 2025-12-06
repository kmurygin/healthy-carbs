import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';

import {DietitianRecipesFormComponent} from './dietitian-recipes-form.component';

describe('DietitianRecipesFormComponent', () => {
  let component: DietitianRecipesFormComponent;
  let fixture: ComponentFixture<DietitianRecipesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DietitianRecipesFormComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DietitianRecipesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
