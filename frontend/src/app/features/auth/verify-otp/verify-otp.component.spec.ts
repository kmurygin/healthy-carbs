import {type ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {PasswordRecoveryService} from '@core/services/password-recovery/password-recovery.service';
import {NotificationService} from '@core/services/ui/notification.service';

import {VerifyOtpComponent} from './verify-otp.component';

describe('VerifyOtpComponent', () => {
  let component: VerifyOtpComponent;
  let fixture: ComponentFixture<VerifyOtpComponent>;

  beforeEach(async () => {
    spyOnProperty(history, 'state', 'get').and.returnValue({username: 'test_user'});

    await TestBed.configureTestingModule({
      imports: [VerifyOtpComponent],
      providers: [
        provideRouter([]),
        {
          provide: PasswordRecoveryService,
          useValue: jasmine.createSpyObj('PasswordRecoveryService', ['verifyOtp'])
        },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', ['success', 'error'])
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
