import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  categories = [
    {
      name: 'Plan żywieniowy',
      route: 'mealplan-form',
      image: 'assets/images/kalendarz-1.jpg'
    },
    {
      name: 'Współpraca z dietetykiem',
      route: 'plan_zywieniowy',
      image: 'assets/images/dietetyk-kliniczny-1024x683.jpg'
    },
    {
      name: 'Pomiary obwodów',
      route: 'plan_zywieniowy',
      image: 'assets/images/mierzenie.jpg'
    },
    {
      name: 'TEST',
      route: 'plan_zywieniowy',
      image: 'assets/images/senyszyn_imperator.jpg'
    },
    {
      name: 'TEST',
      route: 'plan_zywieniowy',
      image: 'assets/images/senyszyn_imperator.jpg'
    },
    {
      name: 'TEST',
      route: 'plan_zywieniowy',
      image: 'assets/images/senyszyn_imperator.jpg'
    },
    {
      name: 'TEST',
      route: 'plan_zywieniowy',
      image: 'assets/images/senyszyn_imperator.jpg'
    },
    {
      name: 'TEST',
      route: 'plan_zywieniowy',
      image: 'assets/images/senyszyn_imperator.jpg'
    },
  ];
}
