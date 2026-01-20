import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';

import {RecipeComponent} from './recipe.component';

describe('RecipeComponent', () => {
  let component: RecipeComponent;
  let fixture: ComponentFixture<RecipeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeComponent],
      providers: [provideRouter([])]
    })
      .compileComponents();

    fixture = TestBed.createComponent(RecipeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
