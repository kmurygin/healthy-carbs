import {type ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {PasswordRecoveryService} from '@core/services/password-recovery/password-recovery.service';
import {NotificationService} from '@core/services/ui/notification.service';
import {vi} from 'vitest'
import {VerifyOtpComponent} from './verify-otp.component';

describe('VerifyOtpComponent', () => {
  let component: VerifyOtpComponent;
  let fixture: ComponentFixture<VerifyOtpComponent>;

  beforeEach(async () => {
    vi.spyOn(history, 'state', 'get').mockReturnValue({username: 'test_user'});

    await TestBed.configureTestingModule({
      imports: [VerifyOtpComponent],
      providers: [
        provideRouter([]),
        {
          provide: PasswordRecoveryService,
          useValue: {
            verifyOtp: vi.fn().mockName("PasswordRecoveryService.verifyOtp")
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

    fixture = TestBed.createComponent(VerifyOtpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
