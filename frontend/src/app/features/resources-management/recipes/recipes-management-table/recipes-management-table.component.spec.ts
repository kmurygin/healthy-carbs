import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';

import {RecipesManagementTableComponent} from './recipes-management-table.component';

describe('RecipesManagementTableComponent', () => {
  let component: RecipesManagementTableComponent;
  let fixture: ComponentFixture<RecipesManagementTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipesManagementTableComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(RecipesManagementTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('recipes', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
