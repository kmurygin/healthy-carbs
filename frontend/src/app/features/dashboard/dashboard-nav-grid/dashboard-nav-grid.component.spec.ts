import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';

import {DashboardNavGridComponent} from './dashboard-nav-grid.component';

describe('DashboardNavGridComponent', () => {
  let component: DashboardNavGridComponent;
  let fixture: ComponentFixture<DashboardNavGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardNavGridComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DashboardNavGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
