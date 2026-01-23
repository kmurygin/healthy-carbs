import {type ComponentFixture, TestBed} from '@angular/core/testing';
import {vi} from 'vitest';
import {provideRouter} from '@angular/router';
import {PasswordRecoveryService} from '@core/services/password-recovery/password-recovery.service';
import {NotificationService} from '@core/services/ui/notification.service';
import {ResetPasswordComponent} from './reset-password.component';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;

  beforeEach(async () => {
    vi.spyOn(history, 'state', 'get').mockReturnValue({username: 'test_user', otp: '123456'});

    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponent],
      providers: [
        provideRouter([]),
        {
          provide: PasswordRecoveryService,
          useValue: {
            resetPassword: vi.fn().mockName("PasswordRecoveryService.resetPassword")
          }
        },
        {
          provide: NotificationService,
          useValue: {
            success: vi.fn().mockName("NotificationService.success"),
            error: vi.fn().mockName("NotificationService.error")
          }
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
