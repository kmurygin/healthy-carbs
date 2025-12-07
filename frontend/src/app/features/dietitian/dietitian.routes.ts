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
    loadComponent: () => import('./dietitian-recipes/dietitian-recipes.component')
      .then(m => m.DietitianRecipesComponent),
    title: 'Recipes'
  },
  {
    path: 'ingredients',
    loadComponent: () => import('./dietitian-ingredients/dietitian-ingredients.component')
      .then(m => m.DietitianIngredientsComponent),
    title: 'Ingredients'
  },
];
