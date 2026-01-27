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
  {
    path: 'allergens',
    loadComponent: () => import('@features/resources-management/allergens/allergens-management/allergens-management.component')
      .then(m => m.AllergensManagementComponent),
    title: 'Allergens'
  },
  {
    path: 'clients',
    loadComponent: () => import('@features/dietitian/clients/client-list/client-list.component')
      .then(m => m.ClientListComponent),
    title: 'My Clients'
  },
  {
    path: 'clients/:clientId/measurements',
    loadComponent: () => import('@features/dietitian/clients/client-progress/client-progress.component')
      .then(m => m.ClientProgressComponent),
    title: 'Client Progress'
  },
  {
    path: 'clients/:clientId/create-meal-plan',
    loadComponent: () => import('@features/dietitian/meal-plan-creator/meal-plan-creator/meal-plan-creator.component')
      .then(m => m.MealPlanCreatorComponent),
    title: 'Create Meal Plan'
  },
  {
    path: 'clients/:clientId/meal-plans',
    loadComponent: () => import('@features/dietitian/clients/client-mealplans/client-mealplans.component')
      .then(m => m.ClientMealPlansComponent),
    title: 'Client Meal Plans'
  }
];
