import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';

import {RecipesManagementFormComponent} from './recipes-management-form.component';

describe('RecipesManagementFormComponent', () => {
  let component: RecipesManagementFormComponent;
  let fixture: ComponentFixture<RecipesManagementFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipesManagementFormComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(RecipesManagementFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
