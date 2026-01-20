import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';

import {ErrorMessageComponent} from './error-message.component';

describe('ErrorMessageComponent', () => {
  let component: ErrorMessageComponent;
  let fixture: ComponentFixture<ErrorMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorMessageComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ErrorMessageComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create component instance successfully', () => {
      fixture.componentRef.setInput('message', 'Test error');
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should display error message text when message input is provided', () => {
      const errorText = 'An error occurred';
      fixture.componentRef.setInput('message', errorText);
      fixture.detectChanges();

      const messageElement = fixture.nativeElement.textContent;
      expect(messageElement).toContain(errorText);
    });

    it('should handle empty error message gracefully', () => {
      fixture.componentRef.setInput('message', '');
      fixture.detectChanges();

      expect(component).toBeTruthy();
    });

    it('should display validation error messages appropriately', () => {
      const validationError = 'This field is required';
      fixture.componentRef.setInput('message', validationError);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain(validationError);
    });

    it('should display network error messages appropriately', () => {
      const networkError = 'Network request failed. Please try again.';
      fixture.componentRef.setInput('message', networkError);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain(networkError);
    });
  });
});
