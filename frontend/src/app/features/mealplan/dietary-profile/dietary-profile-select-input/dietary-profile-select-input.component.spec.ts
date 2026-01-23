import {type ComponentFixture, TestBed} from '@angular/core/testing';
import {vi} from 'vitest'
import {DietaryProfileSelectInputComponent} from './dietary-profile-select-input.component';

describe('DietaryProfileSelectInputComponent', () => {
  let component: DietaryProfileSelectInputComponent;
  let fixture: ComponentFixture<DietaryProfileSelectInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DietaryProfileSelectInputComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DietaryProfileSelectInputComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 'test-id');
    fixture.componentRef.setInput('label', 'Test Label');
    fixture.componentRef.setInput('options', []);
    fixture.detectChanges();
  });

  it('component_whenCreated_shouldBeTruthy', () => {
    expect(component).toBeTruthy();
  });

  it('onSelectChange_whenCalled_shouldUpdateValueAndEmit', () => {
    const changeSpy = vi.fn();
    component.registerOnChange(changeSpy);

    const event = {target: {value: 'TEST'}} as unknown as Event;
    component.onSelectChange(event);

    expect(component.value()).toBe('TEST');
    expect(changeSpy).toHaveBeenCalledWith('TEST');
  });
});
