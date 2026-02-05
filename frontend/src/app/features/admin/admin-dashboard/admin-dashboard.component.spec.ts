import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';
import {AdminDashboardComponent} from './admin-dashboard.component';
import {provideRouter} from '@angular/router';
import {UserRole} from '@core/models/enum/user-role.enum';
import {AuthService} from '@core/services/auth/auth.service';
import {signal} from '@angular/core';

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;

  const mockAuthService = {
    user: signal('testuser'),
    userRole: signal(UserRole.ADMIN)
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent],
      providers: [
        provideRouter([]),
        {provide: AuthService, useValue: mockAuthService}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('constructor_defaultState_componentCreated', () => {
    expect(component).toBeTruthy();
  });

  it('dashboardMenuItems_userIsAdmin_returnsAllMenuItems', () => {
    expect(component.dashboardMenuItems.length).toBeGreaterThan(0);
  });
});
