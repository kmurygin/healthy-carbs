import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';

import {RecipeCountInfoComponent} from './recipe-count-info.component';

describe('RecipeCountInfoComponent', () => {
  let component: RecipeCountInfoComponent;
  let fixture: ComponentFixture<RecipeCountInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeCountInfoComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(RecipeCountInfoComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('startIndex', 0);
    fixture.componentRef.setInput('endIndex', 9);
    fixture.componentRef.setInput('totalRecipeCount', 100);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
