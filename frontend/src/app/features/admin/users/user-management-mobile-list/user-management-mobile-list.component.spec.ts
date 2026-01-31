import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';
import {UserManagementMobileListComponent} from './user-management-mobile-list.component';

describe('UserManagementMobileListComponent', () => {
  let component: UserManagementMobileListComponent;
  let fixture: ComponentFixture<UserManagementMobileListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserManagementMobileListComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UserManagementMobileListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('users', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
