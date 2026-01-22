import {type ComponentFixture, TestBed} from '@angular/core/testing';

import {SuccessMessageComponent} from './success-message.component';

describe('SuccessMessageComponent', () => {
  let component: SuccessMessageComponent;
  let fixture: ComponentFixture<SuccessMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuccessMessageComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SuccessMessageComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create component instance successfully', () => {
      fixture.componentRef.setInput('message', 'Test success message');
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should display success message text when message input is provided', () => {
      const testMessage = 'Operation completed successfully';
      fixture.componentRef.setInput('message', testMessage);
      fixture.detectChanges();

      const hostElement = fixture.nativeElement as HTMLElement;
      expect(hostElement.textContent).toContain(testMessage);
    });

    it('should handle empty message gracefully', () => {
      fixture.componentRef.setInput('message', '');
      fixture.detectChanges();

      expect(component).toBeTruthy();
    });
  });
});
