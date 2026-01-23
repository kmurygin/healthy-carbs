import type {MockedObject} from "vitest";
import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';
import {of} from 'rxjs';
import {vi} from 'vitest'
import {DietaryProfileFormComponent} from './dietary-profile-form.component';
import {DietaryProfileService} from '@core/services/dietary-profile/dietary-profile.service';

describe('DietaryProfileFormComponent', () => {
  let component: DietaryProfileFormComponent;
  let fixture: ComponentFixture<DietaryProfileFormComponent>;
  let dietaryProfileServiceSpy: MockedObject<Pick<DietaryProfileService, 'getProfile' | 'save'>>;

  beforeEach(async () => {
    dietaryProfileServiceSpy = {
      getProfile: vi.fn().mockName("DietaryProfileService.getProfile"),
      save: vi.fn().mockName("DietaryProfileService.save")
    };
    dietaryProfileServiceSpy.getProfile.mockReturnValue(of(null));
    dietaryProfileServiceSpy.save.mockReturnValue(of(null));

    await TestBed.configureTestingModule({
      imports: [DietaryProfileFormComponent],
      providers: [
        {provide: DietaryProfileService, useValue: dietaryProfileServiceSpy}
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DietaryProfileFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('component_whenCreated_shouldBeTruthy', () => {
    expect(component).toBeTruthy();
  });

  it('formGroup_whenInitialized_shouldHaveRequiredControls', () => {
    const controls = component.formGroup.controls;
    expect(controls.age).toBeTruthy();
    expect(controls.gender).toBeTruthy();
    expect(controls.weight).toBeTruthy();
    expect(controls.height).toBeTruthy();
    expect(controls.goal).toBeTruthy();
    expect(controls.dietaryPreference).toBeTruthy();
    expect(controls.activityLevel).toBeTruthy();
  });

  it('fields_whenInitialized_shouldExposeDefinitions', () => {
    expect(component.personalInformationFields.length).toBeGreaterThan(0);
    expect(component.preferenceFields.length).toBeGreaterThan(0);
  });
});
