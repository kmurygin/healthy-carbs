import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngredientsManagementMobileListComponent } from './ingredients-management-mobile-list.component';

describe('IngredientsManagementMobileListComponent', () => {
  let component: IngredientsManagementMobileListComponent;
  let fixture: ComponentFixture<IngredientsManagementMobileListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngredientsManagementMobileListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IngredientsManagementMobileListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
