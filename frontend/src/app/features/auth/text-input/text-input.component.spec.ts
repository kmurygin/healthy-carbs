import {type ComponentFixture, TestBed} from '@angular/core/testing';

import {TextInputComponent} from './text-input.component';

describe('TextInputComponent', () => {
  let component: TextInputComponent;
  let fixture: ComponentFixture<TextInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextInputComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TextInputComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'Test Label');
    fixture.componentRef.setInput('id', 'test-id');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
