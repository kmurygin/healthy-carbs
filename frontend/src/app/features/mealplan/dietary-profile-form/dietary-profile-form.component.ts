import {ChangeDetectionStrategy, Component, effect, inject, signal,} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {DietaryProfileService} from "../../../core/services/dietary-profile/dietary-profile.service";
import type {DietaryProfilePayload} from "../../../core/models/payloads/dietaryprofile.payload";
import {CommonModule} from "@angular/common";
import {DietGoal} from "../../../core/models/enum/diet-goal.enum";
import {DietType} from "../../../core/models/enum/diet-type.enum";
import {ActivityLevel} from "../../../core/models/enum/activity-level.enum";
import {Allergy} from "../../../core/models/enum/allergy.enum";
import {firstValueFrom} from 'rxjs';
import {ErrorMessageComponent} from "../../../shared/components/error-message/error-message.component";
import {SuccessMessageComponent} from "../../../shared/components/success-message/success-message.component";
import {getFormOptionsFromEnum} from "../../../shared/form-option";
import {ActivityLevelDescriptionMap} from "../../../core/constants/activity-level-description.map";

@Component({
  selector: 'app-dietary-profile-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    ErrorMessageComponent,
    SuccessMessageComponent,
  ],
  templateUrl: './dietary-profile-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.aria-busy]': 'submitting() ? "true" : null',
    class: 'block',
  },
})
export class DietaryProfileFormComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly profileService = inject(DietaryProfileService);

  readonly isLoading = signal(true);
  readonly profileExists = signal(false);
  readonly submitting = signal(false);
  readonly submitted = signal(false);
  readonly formError = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly selectedAllergies = signal<Set<Allergy>>(new Set());

  readonly goals = getFormOptionsFromEnum(DietGoal);
  readonly diets = getFormOptionsFromEnum(DietType);
  readonly activityLevels = getFormOptionsFromEnum(ActivityLevel);
  readonly allergies = Object.values(Allergy);

  readonly formGroup = this.formBuilder.group({
    age: this.formBuilder.control<number | null>(null, [
      Validators.required,
      Validators.min(1),
      Validators.max(120)
    ]),
    gender: this.formBuilder.control<'MALE' | 'FEMALE' | 'OTHER' | ''>('', [
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
    dietaryPreference: this.formBuilder.control<DietType | ''>('', [
      Validators.required
    ]),
    activityLevel: this.formBuilder.control<ActivityLevel | ''>('', [
      Validators.required
    ]),
    allergies: this.formBuilder.control<Allergy[]>([]),
  });

  constructor() {
    this.loadProfile();
    effect(() => {
      this.formGroup.controls.allergies.setValue([...this.selectedAllergies()]);
    });
  }

  private loadProfile(): void {
    this.isLoading.set(true);
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.profileExists.set(profile !== null);
        console.log(profile);
      },
      error: (err) => {
        this.profileExists.set(false);
        this.isLoading.set(false);
        console.log(err)
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }

  getFormControl(name: keyof typeof this.formGroup.controls) {
    return this.formGroup.controls[name];
  }

  showError(name: keyof typeof this.formGroup.controls): boolean {
    const formControl = this.getFormControl(name);
    return (formControl.touched || this.submitted()) && formControl.invalid;
  }

  toggleAllergy(allergy: Allergy) {
    this.selectedAllergies.update((prev) => {
      const next = new Set(prev);
      next.has(allergy) ? next.delete(allergy) : next.add(allergy);
      return next;
    });
    this.successMessage.set(null);
  }

  async onSubmit() {
    this.submitted.set(true);
    this.formError.set(null);
    this.successMessage.set(null);

    if (this.formGroup.invalid) {
      this.formError.set('Please fix the errors below and try again.');
      return;
    }

    try {
      this.submitting.set(true);
      this.formGroup.disable({ emitEvent: false });

      const formValue = this.formGroup.getRawValue();

      const payload: DietaryProfilePayload = {
        age: formValue.age!,
        gender: formValue.gender!,
        weight: formValue.weight!,
        height: formValue.height!,
        dietGoal: formValue.goal!,
        dietType: formValue.dietaryPreference!,
        activityLevel: formValue.activityLevel!,
        allergies: formValue.allergies,
      };

      await firstValueFrom(this.profileService.save(payload));

      this.successMessage.set('Your profile has been saved successfully!');
      this.profileExists.set(true);
    } catch (err) {
      this.formError.set('Saving failed. Please try again later.');
      console.error(err);
    } finally {
      this.formGroup.enable({ emitEvent: false });
      this.submitting.set(false);
    }
  }

  onReset() {
    this.formGroup.reset();
    this.selectedAllergies.set(new Set());
    this.submitted.set(false);
    this.formError.set(null);
  }

  protected readonly ActivityLevelDescriptionMap = ActivityLevelDescriptionMap;
}
