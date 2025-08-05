import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatButtonModule} from '@angular/material/button';
import {MatStepperModule} from '@angular/material/stepper';
import {STEPPER_GLOBAL_OPTIONS} from '@angular/cdk/stepper';

@Component({
  selector: 'app-mealplan-form',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatStepperModule,
  ],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: {showError: true}
    }
  ],
  templateUrl: './mealplan-form.component.html',
  styleUrl: './mealplan-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MealplanFormComponent {

  basicInfoForm: FormGroup;
  physicalMeasurementsForm: FormGroup;
  dietaryInfoForm: FormGroup;
  allergiesForm: FormGroup;

  formData = signal({});

  allergies = [
    'Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Wheat', 'Soy', 'Fish', 'Shellfish'
  ];
  activityLevels = [
    "Sedentary",
    "Active",
    "Very active",
  ];
  diets = [
    "Vegan",
    "Vegetarian",
    "No-fish",
    "Standard"
  ]
  goals = [
    "reduce",
    "gain",
    "maintenance"
  ]

  constructor(private fb: FormBuilder) {

    this.basicInfoForm = this.fb.group({
      age: ['', Validators.required],
      gender: ['', Validators.required],
    });

    this.physicalMeasurementsForm = this.fb.group({
      weight: ['', Validators.required],
      height: ['', Validators.required],
    });

    this.dietaryInfoForm = this.fb.group({
      goal: ['', Validators.required],
      dietaryPreference: ['', Validators.required],
      activityLevel: ['', Validators.required],
    });

    this.allergiesForm = this.fb.group({
      allergies: [[]]
    });
  }

  onSubmit() {

    this.formData.set({
      ...this.basicInfoForm.value,
      ...this.physicalMeasurementsForm.value,
      ...this.dietaryInfoForm.value,
      ...this.allergiesForm.value
    });
    console.log(this.formData());
  }

  updateAllergies(event: { checked: boolean }, allergy: string) {
    const allergies = this.allergiesForm.get('allergies')!.value || [];
    if (event.checked) {
      allergies.push(allergy.toLowerCase().replace(' ', '-'));
    } else {
      const index = allergies.indexOf(allergy.toLowerCase().replace(' ', '-'));
      if (index >= 0) {
        allergies.splice(index, 1);
      }
    }
    this.allergiesForm.get('allergies')!.setValue(allergies);
  }
}
