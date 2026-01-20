import {type ComponentFixture, TestBed} from '@angular/core/testing';

import {DietaryProfileTextInputComponent} from './dietary-profile-text-input.component';

describe('DietaryProfileTextInputComponent', () => {
  let component: DietaryProfileTextInputComponent;
  let fixture: ComponentFixture<DietaryProfileTextInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DietaryProfileTextInputComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DietaryProfileTextInputComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 'test-id');
    fixture.componentRef.setInput('label', 'Test Label');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
