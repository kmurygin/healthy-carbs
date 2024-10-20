import {Component, inject} from '@angular/core';
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-dashboard',
  standalone: true,
    imports: [
        RouterLink,
    ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent{
  categories = [ "mealplan_generator", "dietician", "diets_to_buy"];
}
