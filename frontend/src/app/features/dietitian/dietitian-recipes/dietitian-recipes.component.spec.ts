import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';

import {DietitianRecipesComponent} from './dietitian-recipes.component';

describe('DietitianRecipesComponent', () => {
  let component: DietitianRecipesComponent;
  let fixture: ComponentFixture<DietitianRecipesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DietitianRecipesComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DietitianRecipesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
