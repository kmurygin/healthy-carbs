import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import type {Color} from '@swimlane/ngx-charts';
import {LegendPosition, NgxChartsModule, ScaleType} from '@swimlane/ngx-charts';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    NgxChartsModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {

  isSmallScreen = window.innerWidth < 768;
  categories = [
    {
      name: 'Plan żywieniowy',
      route: 'mealplan-form',
      image: 'assets/images/6325254.jpg'
    },
    {
      name: 'Kalendarz posiłków',
      route: 'calendar',
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
  weightData = [
    {
      name: 'Waga',
      series: [
        {name: '15 Maj', value: 100.2},
        {name: '20 Maj', value: 84.5},
        {name: '25 Maj', value: 84.0},
        {name: '31 Maj', value: 83.6},
        {name: '5 Cze', value: 83.0},
        {name: '10 Cze', value: 82.5},
        {name: '15 Cze', value: 81.9},
        {name: '20 Cze', value: 80.8},
        {name: '25 Cze', value: 79.9},
        {name: '30 Cze', value: 78.9},
        {name: '5 Lip', value: 78.1},
        {name: '10 Lip', value: 77.3}
      ]
    }
  ];
  caloriesData = [
    {name: 'Białka', value: 30},
    {name: 'Tłuszcze', value: 25},
    {name: 'Węglowodany', value: 45}
  ];
  colorScheme: Color = {
    name: 'macroScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Data';
  showYAxisLabel = true;
  yAxisLabel = 'Waga (kg)';
  timeline = true;
  showLabels = true;
  isDoughnut = false;
  legendPosition: LegendPosition = LegendPosition.Right;

  trackCategory = (_: number, cat: { route: string }) => cat.route;

}
