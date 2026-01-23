import {type ComponentFixture, TestBed} from '@angular/core/testing';
import {vi} from 'vitest'
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

  it('component_whenCreated_shouldBeTruthy', () => {
    expect(component).toBeTruthy();
  });

  it('onInputChange_whenCalled_shouldUpdateValueAndEmit', () => {
    const changeSpy = vi.fn();
    component.registerOnChange(changeSpy);

    const event = {target: {value: '123'}} as unknown as Event;
    component.onInputChange(event);

    expect(component.value()).toBe('123');
    expect(changeSpy).toHaveBeenCalledWith('123');
  });
});
