import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';

import {DashboardRecipeCardComponent} from './dashboard-recipe-card.component';

describe('DashboardRecipeCardComponent', () => {
  let component: DashboardRecipeCardComponent;
  let fixture: ComponentFixture<DashboardRecipeCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardRecipeCardComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DashboardRecipeCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
