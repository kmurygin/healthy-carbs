import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';

import {RecipesManagementMobileListComponent} from './recipes-management-mobile-list.component';

describe('RecipesManagementMobileListComponent', () => {
  let component: RecipesManagementMobileListComponent;
  let fixture: ComponentFixture<RecipesManagementMobileListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipesManagementMobileListComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(RecipesManagementMobileListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
