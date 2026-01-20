import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';

import {RecipeFilterComponent} from './recipe-filter.component';

describe('RecipeFilterComponent', () => {
  let component: RecipeFilterComponent;
  let fixture: ComponentFixture<RecipeFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeFilterComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(RecipeFilterComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('dietTypes', []);
    fixture.componentRef.setInput('mealTypes', []);
    fixture.componentRef.setInput('sortOptions', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
