import type {OnInit} from '@angular/core';
import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {UserMeasurementService} from '@core/services/user-measurement/user-measurement.service';
import {NgApexchartsModule} from 'ng-apexcharts';
import {faArrowRight} from "@fortawesome/free-solid-svg-icons";
import {RouterLink} from "@angular/router";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import type {ChartOptions} from "@core/models/chart-options.model";

interface DashboardCategory {
  name: string;
  route: string;
  image: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, NgApexchartsModule, RouterLink, FaIconComponent, NgOptimizedImage],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  public readonly weightChartOptions = signal<Partial<ChartOptions>>({
    series: [],
    chart: {type: 'area', height: 350, toolbar: {show: false}},
    dataLabels: {enabled: true},
    stroke: {curve: 'smooth', width: 2},
    xaxis: {type: 'datetime'},
    tooltip: {x: {format: 'dd MMM yyyy HH:mm'}},
    grid: {borderColor: '#f1f1f1'},
    markers: {size: 5}
  });
  public readonly macroChartOptions = signal<Partial<ChartOptions>>({
    series: [30, 25, 45],
    labels: ['Białka', 'Tłuszcze', 'Węglowodany'],
    chart: {
      type: 'donut',
      height: 350
    },
    colors: ['#5AA454', '#A10A28', '#C7B42C'],
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Kalorie',
              formatter: (chartContext: { globals: { seriesTotals: number[] } }): string => {
                return chartContext.globals.seriesTotals
                  .reduce((accumulator: number, currentValue: number) => accumulator + currentValue, 0)
                  .toFixed(0);
              }
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    legend: {
      position: 'bottom'
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: function (value: number): string {
          return `${value}%`;
        }
      }
    }
  });
  categories: DashboardCategory[] = [
    {
      name: 'Latest meal plan',
      route: '/mealplan',
      image: 'assets/images/6325254.jpg'
    },
    {
      name: 'My mealplans',
      route: '/user/mealplan-history',
      image: 'assets/images/6325254.jpg'
    },
    {
      name: 'Diet profile',
      route: '/dietary-profile-form',
      image: 'assets/images/6325254.jpg'
    },
    {
      name: 'Measurements',
      route: '/user-measurements',
      image: 'assets/images/6325254.jpg'
    },
    {
      name: 'Recipes',
      route: '/recipes',
      image: 'assets/images/6325254.jpg'
    },
    {
      name: 'Buy a diet plan',
      route: '/offers',
      image: 'assets/images/6325254.jpg'
    }
  ];
  protected readonly faArrowRight = faArrowRight;
  private readonly measurementService = inject(UserMeasurementService);

  ngOnInit(): void {
    this.loadWeightHistory();
  }

  private loadWeightHistory(): void {
    this.measurementService.getAllHistory().subscribe({
      next: (history) => {
        const data = history ?? [];

        const seriesData = data.map(item => [
          new Date(item.date).getTime(),
          item.weight
        ]);

        this.weightChartOptions.update(options => ({
          ...options,
          series: [{name: "Waga", data: seriesData}]
        }));
      },
      error: (err: unknown) => {
        console.error('Failed to load history', err);
      }
    });
  }
}
