import { Component } from '@angular/core';
import {FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';

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
  ],
  templateUrl: './mealplan-form.component.html',
  styleUrl: './mealplan-form.component.scss'
})
export class MealplanFormComponent {
  form: FormGroup;
  allergies = [
    'Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Wheat', 'Soy', 'Fish', 'Shellfish'
  ];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      age: ['', Validators.required],
      weight: ['', Validators.required],
      height: ['', Validators.required],
      goal: ['', Validators.required],
      gender: ['', Validators.required],
      dietaryPreference: ['', Validators.required],
      activityLevel: ['', Validators.required],
      allergies: [[]]
    });
  }

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

  onSubmit() {
    console.log(this.form.value);
  }
}
