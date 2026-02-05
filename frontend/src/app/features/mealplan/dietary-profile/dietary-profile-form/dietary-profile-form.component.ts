import {ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, signal} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {DietaryProfileService} from "@core/services/dietary-profile/dietary-profile.service";
import type {DietaryProfilePayload} from "@core/models/payloads/dietaryprofile.payload";
import {DietGoal} from "@core/models/enum/diet-goal.enum";
import {ActivityLevel} from "@core/models/enum/activity-level.enum";
import {DietTypeService} from "@core/services/diet-type/diet-type.service";
import {firstValueFrom} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ErrorMessageComponent} from "@shared/components/error-message/error-message.component";
import {SuccessMessageComponent} from "@shared/components/success-message/success-message.component";
import {type FormOption, getFormOptionsFromEnum} from "@shared/form-option";
import {formatEnum} from "@shared/utils";
import {ActivityLevelDescriptionMap} from "@core/constants/activity-level-description.map";
import {AllergenService} from "@core/services/allergen/allergen.service";
import type {AllergenDto} from "@core/models/dto/allergen.dto";
import {
  DietaryProfileTextInputComponent,
} from "@features/mealplan/dietary-profile/dietary-profile-text-input/dietary-profile-text-input.component";
import {
  DietaryProfileSelectInputComponent
} from "@features/mealplan/dietary-profile/dietary-profile-select-input/dietary-profile-select-input.component";
import type {DietaryFieldConfig} from "@features/mealplan/dietary-profile/dietary-field.config";
import {Gender} from "@core/models/enum/gender.enum";

@Component({
  selector: 'app-dietary-profile',
  imports: [
    ReactiveFormsModule,
    ErrorMessageComponent,
    SuccessMessageComponent,
    DietaryProfileTextInputComponent,
    DietaryProfileSelectInputComponent
  ],
  templateUrl: './dietary-profile-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.aria-busy]': 'submitting() ? "true" : null',
    class: 'block',
  },
})
export class DietaryProfileFormComponent {
  readonly isLoading = signal(true);
  readonly profileExists = signal(false);
  readonly submitting = signal(false);
  readonly submitted = signal(false);
  readonly formError = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly selectedAllergies = signal<Set<string>>(new Set());
  readonly availableAllergens = signal<AllergenDto[]>([]);

  readonly goals = getFormOptionsFromEnum(DietGoal);
  readonly diets = signal<FormOption<string>[]>([]);
  readonly activityLevelOptions = getFormOptionsFromEnum(ActivityLevel);
  readonly genderOptions = getFormOptionsFromEnum(Gender);
  readonly personalInformationFields: DietaryFieldConfig[] = [
    {
      key: 'age',
      label: 'Age',
      controlType: 'input',
      type: 'number',
      placeholder: '0',
      autocomplete: 'off',
      min: 1,
      max: 120,
      step: 1,
      inputMode: 'numeric'
    },
    {
      key: 'gender',
      label: 'Gender',
      controlType: 'select',
      type: 'text',
      placeholder: '',
      autocomplete: 'sex',
      options: this.genderOptions
    },
    {
      key: 'weight',
      label: 'Weight (kg)',
      controlType: 'input',
      type: 'number',
      placeholder: '0',
      autocomplete: 'off',
      min: 20,
      max: 400,
      inputMode: 'decimal'
    },
    {
      key: 'height',
      label: 'Height (cm)',
      controlType: 'input',
      type: 'number',
      placeholder: '0',
      autocomplete: 'off',
      min: 80,
      max: 250,
      inputMode: 'decimal'
    },
  ];
  readonly preferenceFields = computed<DietaryFieldConfig[]>(() => [
    {
      key: 'goal',
      label: 'Dietary Goal',
      controlType: 'select',
      type: 'text',
      placeholder: '',
      autocomplete: 'off',
      options: this.goals
    },
    {
      key: 'dietaryPreference',
      label: 'Dietary Preference',
      controlType: 'select',
      type: 'text',
      placeholder: '',
      autocomplete: 'off',
      options: this.diets()
    },
    {
      key: 'activityLevel',
      label: 'Weekly Activity Level',
      controlType: 'select',
      type: 'text',
      placeholder: '',
      autocomplete: 'off',
      options: this.activityLevelOptions.map((option: FormOption<ActivityLevel>) => ({
        ...option,
        description: ActivityLevelDescriptionMap[option.value]
      }))
    },
  ]);
  private readonly dietTypeService = inject(DietTypeService);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  readonly formGroup = this.formBuilder.group({
    age: this.formBuilder.control<number | null>(null, [
      Validators.required,
      Validators.min(1),
      Validators.max(120)
    ]),
    gender: this.formBuilder.control<Gender | ''>('', [
      Validators.required
    ]),
    weight: this.formBuilder.control<number | null>(null, [
      Validators.required,
      Validators.min(20),
      Validators.max(400)
    ]),
    height: this.formBuilder.control<number | null>(null, [
      Validators.required,
      Validators.min(80),
      Validators.max(250)
    ]),
    goal: this.formBuilder.control<DietGoal | ''>('', [
      Validators.required
    ]),
    dietaryPreference: this.formBuilder.control('', [
      Validators.required
    ]),
    activityLevel: this.formBuilder.control<ActivityLevel | ''>('', [
      Validators.required
    ]),
    allergies: this.formBuilder.control<string[]>([]),
  });
  private readonly profileService = inject(DietaryProfileService);
  private readonly allergenService = inject(AllergenService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.loadProfile();
    this.loadAllergens();
    this.loadDietTypes();
    effect(() => {
      this.formGroup.controls.allergies.setValue([...this.selectedAllergies()]);
    });
  }

  toggleAllergy(allergy: string) {
    this.selectedAllergies.update((prev) => {
      const next = new Set(prev);
      if (next.has(allergy)) {
        next.delete(allergy);
      } else {
        next.add(allergy);
      }
      return next;
    });
    this.successMessage.set(null);
  }

  async onSubmit() {
    this.submitted.set(true);
    this.formError.set(null);
    this.successMessage.set(null);

    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      this.formError.set('Please fix the errors below and try again.');
      return;
    }

    try {
      this.submitting.set(true);
      this.formGroup.disable({emitEvent: false});
      const formValue = this.formGroup.getRawValue();

      const payload: DietaryProfilePayload = {
        age: formValue.age ?? 0,
        weight: formValue.weight ?? 0,
        height: formValue.height ?? 0,
        gender: formValue.gender as Gender,
        dietGoal: formValue.goal as DietGoal,
        dietType: formValue.dietaryPreference,
        activityLevel: formValue.activityLevel as ActivityLevel,
        allergies: formValue.allergies,
      };

      await firstValueFrom(this.profileService.save(payload));
      this.successMessage.set('Your profile has been saved successfully!');
      this.profileExists.set(true);
    } catch (err) {
      this.formError.set('Saving failed. Please try again later.');
      console.error(err);
    } finally {
      this.formGroup.enable({emitEvent: false});
      this.submitting.set(false);
    }
  }

  onReset() {
    this.formGroup.reset();
    this.selectedAllergies.set(new Set());
    this.submitted.set(false);
    this.formError.set(null);
  }

  private loadDietTypes(): void {
    this.dietTypeService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (types) => {
        this.diets.set(types.map(t => ({value: t.name, label: formatEnum(t.name)})));
      },
      error: (err: unknown) => {
        console.error('Failed to load diet types', err);
      }
    });
  }

  private loadAllergens(): void {
    this.allergenService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        this.availableAllergens.set(data);
      },
      error: (err: unknown) => {
        console.error('Failed to load allergens', err);
      }
    });
  }

  private loadProfile(): void {
    this.isLoading.set(true);
    this.profileService.getProfile().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (profile) => {
        this.profileExists.set(!!profile);
        this.isLoading.set(false);
      },
      error: (err: unknown) => {
        this.profileExists.set(false);
        this.isLoading.set(false);
        console.error(err);
      }
    });
  }
}
