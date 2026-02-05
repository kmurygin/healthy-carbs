import type {Routes} from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin-dashboard/admin-dashboard.component')
      .then(m => m.AdminDashboardComponent),
    title: 'Admin Dashboard'
  },
  {
    path: 'users',
    loadComponent: () => import('./users/user-management/user-management.component')
      .then(m => m.UserManagementComponent),
    title: 'User Management'
  },
  {
    path: 'recipes',
    loadComponent: () => import('@features/resources-management/recipes/recipes-management/recipes-management.component')
      .then(m => m.RecipesManagementComponent),
    title: 'Recipes Management'
  },
  {
    path: 'ingredients',
    loadComponent: () => import('@features/resources-management/ingredients/ingredients-management/ingredients-management.component')
      .then(m => m.IngredientsManagementComponent),
    title: 'Ingredients Management'
  },
  {
    path: 'allergens',
    loadComponent: () => import('@features/resources-management/allergens/allergens-management/allergens-management.component')
      .then(m => m.AllergensManagementComponent),
    title: 'Allergens Management'
  },
  {
    path: 'diet-types',
    loadComponent: () => import('./diet-types/diet-types-management.component')
      .then(m => m.DietTypesManagementComponent),
    title: 'Diet Types Management'
  },
  {
    path: 'blog',
    loadComponent: () => import('@features/blog/blog-list/blog-list.component')
      .then(m => m.BlogListComponent),
    title: 'Blog Management'
  }
];
