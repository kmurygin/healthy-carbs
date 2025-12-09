import type {Routes} from '@angular/router';

export const DIETITIAN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./dietitian-dashboard/dietitian-dashboard.component')
      .then(m => m.DietitianDashboardComponent),
    title: 'Dietitian Dashboard'
  },
  {
    path: 'recipes',
    loadComponent: () => import('@features/resources-management/recipes/recipes-management/recipes-management.component')
      .then(m => m.RecipesManagementComponent),
    title: 'Recipes'
  },
  {
    path: 'ingredients',
    loadComponent: () => import('@features/resources-management/ingredients/ingredients-management/ingredients-management.component')
      .then(m => m.IngredientsManagementComponent),
    title: 'Ingredients'
  },
];
