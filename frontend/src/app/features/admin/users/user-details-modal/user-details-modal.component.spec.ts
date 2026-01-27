import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';
import {UserDetailsModalComponent} from './user-details-modal.component';
import type {UserDto} from '@core/models/dto/user.dto';
import {UserRole} from '@core/models/enum/user-role.enum';

describe('UserDetailsModalComponent', () => {
  let component: UserDetailsModalComponent;
  let fixture: ComponentFixture<UserDetailsModalComponent>;

  const mockUser: UserDto = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.USER,
    isActive: true,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    profileImageId: null
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDetailsModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UserDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('user', mockUser);
    fixture.componentRef.setInput('profileImageUrl', 'https://example.com/image.png');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
