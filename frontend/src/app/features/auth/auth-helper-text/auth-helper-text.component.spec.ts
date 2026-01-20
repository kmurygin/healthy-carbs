import {type ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';

import {AuthHelperTextComponent} from './auth-helper-text.component';

describe('AuthHelperTextComponent', () => {
  let component: AuthHelperTextComponent;
  let fixture: ComponentFixture<AuthHelperTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthHelperTextComponent],
      providers: [provideRouter([])]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AuthHelperTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
