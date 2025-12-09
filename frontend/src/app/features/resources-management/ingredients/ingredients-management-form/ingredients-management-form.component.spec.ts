import {TestBed} from '@angular/core/testing';
import type {ComponentFixture} from '@angular/core/testing';

import {IngredientsManagementFormComponent} from './ingredients-management-form.component';

describe('IngredientsManagementFormComponent', () => {
  let component: IngredientsManagementFormComponent;
  let fixture: ComponentFixture<IngredientsManagementFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngredientsManagementFormComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(IngredientsManagementFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
