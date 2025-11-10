import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';

import {FavouriteRecipesToggleComponent} from './favourite-recipes-toggle.component';

describe('FavouriteRecipesToggleComponent', () => {
  let component: FavouriteRecipesToggleComponent;
  let fixture: ComponentFixture<FavouriteRecipesToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavouriteRecipesToggleComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(FavouriteRecipesToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
