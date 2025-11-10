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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
