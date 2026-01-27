import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {AuthService} from '@core/services/auth/auth.service';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import type {IconDefinition} from '@fortawesome/free-solid-svg-icons';
import {faArrowRight, faBlog, faCarrot, faShieldAlt, faUsers, faUtensils} from '@fortawesome/free-solid-svg-icons';

interface DashboardMenuItem {
  route: string;
  category: string;
  title: string;
  description: string;
  icon: IconDefinition;
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, FaIconComponent],
  templateUrl: './admin-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDashboardComponent {
  protected readonly arrowIcon = faArrowRight;
  private readonly authService = inject(AuthService);
  readonly username = computed(() => this.authService.user());

  private readonly menuItems: readonly DashboardMenuItem[] = [
    {
      route: '/admin/users',
      category: 'Administration',
      title: 'User Management',
      description: 'Manage all users, roles, and permissions',
      icon: faUsers
    },
    {
      route: '/admin/recipes',
      category: 'Resources',
      title: 'Recipes',
      description: 'Manage all recipes in the system',
      icon: faUtensils
    },
    {
      route: '/admin/ingredients',
      category: 'Resources',
      title: 'Ingredients',
      description: 'Manage ingredients database',
      icon: faCarrot
    },
    {
      route: '/admin/allergens',
      category: 'Resources',
      title: 'Allergens',
      description: 'Manage allergen information',
      icon: faShieldAlt
    },
    {
      route: '/admin/blog',
      category: 'Content',
      title: 'Blog Posts',
      description: 'Create and manage blog articles',
      icon: faBlog
    }
  ];

  readonly dashboardMenuItems = computed(() => {
    return this.menuItems;
  });
}
