import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';

import {IngredientsManagementTableComponent} from './ingredients-management-table.component';

describe('IngredientsManagementTableComponent', () => {
  let component: IngredientsManagementTableComponent;
  let fixture: ComponentFixture<IngredientsManagementTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngredientsManagementTableComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(IngredientsManagementTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('ingredients', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
