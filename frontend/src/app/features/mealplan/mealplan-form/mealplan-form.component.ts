import { Component } from '@angular/core';
import {NgIf} from "@angular/common";
import {ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'app-mealplan-form',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './mealplan-form.component.html',
  styleUrl: './mealplan-form.component.scss'
})
export class MealplanFormComponent {

}
