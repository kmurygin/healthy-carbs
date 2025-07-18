import { Component, ChangeDetectionStrategy } from '@angular/core';
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
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  categories = [
    {
      name: 'Plan żywieniowy',
      route: 'mealplan-form',
      image: 'assets/images/6325254.jpg'
    },
    {
      name: 'Współpraca z dietetykiem',
      route: 'plan_zywieniowy',
      image: 'assets/images/6325254.jpg'
    },
    {
      name: 'Pomiary obwodów',
      route: 'plan_zywieniowy',
      image: 'assets/images/6325254.jpg'
    },
    {
      name: 'Cele żywieniowe',
      route: 'cele',
      image: 'assets/images/6325254.jpg'
    },
    {
      name: 'Historia planów',
      route: 'historia-planow',
      image: 'assets/images/6325254.jpg'
    },
    {
      name: 'Postępy i statystyki',
      route: 'postepy',
      image: 'assets/images/6325254.jpg'
    },
    {
      name: 'Baza przepisów',
      route: 'przepisy',
      image: 'assets/images/6325254.jpg'
    },
    {
      name: 'Ulubione przepisy',
      route: 'ulubione',
      image: 'assets/images/6325254.jpg'
    },
    {
      name: 'Baza wiedzy',
      route: 'wiedza',
      image: 'assets/images/6325254.jpg'
    },
    {
      name: 'Zakup diety',
      route: 'kup-diete',
      image: 'assets/images/6325254.jpg'
    }
  ];



}
