import {type ComponentFixture, TestBed} from '@angular/core/testing';

import {provideRouter} from '@angular/router';
import {PasswordRecoveryService} from '@core/services/password-recovery/password-recovery.service';
import {NotificationService} from '@core/services/ui/notification.service';
import {ResetPasswordComponent} from './reset-password.component';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;

  beforeEach(async () => {
    spyOnProperty(history, 'state', 'get').and.returnValue({username: 'test_user', otp: '123456'});

    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponent],
      providers: [
        provideRouter([]),
        {
          provide: PasswordRecoveryService,
          useValue: jasmine.createSpyObj('PasswordRecoveryService', ['resetPassword'])
        },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', ['success', 'error'])
        }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
