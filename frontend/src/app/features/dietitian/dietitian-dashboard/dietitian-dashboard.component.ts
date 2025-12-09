import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {AuthService} from '@core/services/auth/auth.service';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {
  faArrowRight,
  faCarrot,
  faClipboardList,
  faShieldAlt,
  faUsers,
  faUtensils,
} from '@fortawesome/free-solid-svg-icons';
import type {IconDefinition} from '@fortawesome/free-solid-svg-icons';

interface DashboardMenuItem {
  route: string;
  category: string;
  title: string;
  description: string;
  icon: IconDefinition;
}

@Component({
  selector: 'app-dietitian-dashboard',
  imports: [RouterLink, FaIconComponent],
  templateUrl: './dietitian-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DietitianDashboardComponent {
  readonly authService = inject(AuthService);
  readonly arrowIcon = faArrowRight;

  readonly dashboardMenuItems: DashboardMenuItem[] = [
    {
      route: '/dietitian/recipes',
      category: 'Resources',
      title: 'Recipes',
      description: '',
      icon: faUtensils,
    },
    {
      route: '/dietitian/meal-plans',
      category: 'Planning',
      title: 'Meal Plans',
      description: '',
      icon: faClipboardList,
    },
    {
      route: '/dietitian/ingredients',
      category: 'Resources',
      title: 'Ingredients',
      description: '',
      icon: faCarrot,
    },
    {
      route: '/dietitian/allergens',
      category: 'Resources',
      title: 'Allergens',
      description: '',
      icon: faShieldAlt,
    },
    {
      route: '/dietitian/clients',
      category: 'Clients',
      title: 'My Clients',
      description: '',
      icon: faUsers,
    }
  ];

}
