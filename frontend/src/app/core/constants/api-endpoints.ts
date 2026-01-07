import {environment} from '../../../environments/environment';

const getUrl = (path: string) => `${environment.apiUrl}/${path}`;

export const ApiEndpoints = {
  Auth: {
    Register: getUrl('auth/register'),
    Login: getUrl('auth/authenticate'),
  },

  User: {
    Base: getUrl('users/'),
    GetByUsername: getUrl('users/username/'),
    ChangePassword: getUrl('users/change-password'),
  },

  MealPlan: {
    UserProfile: getUrl('meal-plan/userprofile'),
    Base: getUrl('mealplan'),
  },

  PaymentsPayu: {
    Create: getUrl('payments/payu/create'),
    Status: getUrl('payments/payu/status/'),
    Order: getUrl('payments/payu/order/'),
  },

  Payments: {
    Base: getUrl('payments'),
  },

  Recipes: {
    Base: getUrl('recipes'),
  },

  DietaryProfiles: {
    Base: getUrl('dietary-profiles'),
  },

  ShoppingList: {
    Get: (mealPlanId: number) => getUrl(`shopping-list/${mealPlanId}`),
    UpdateItem: (mealPlanId: number) => getUrl(`shopping-list/${mealPlanId}/item`),
    Download: (mealPlanId: number) => getUrl(`shopping-list/${mealPlanId}/download`),
  },

  Offer: {
    Base: getUrl('offers'),
  },

  Ingredients: {
    Base: getUrl('ingredients'),
    Page: getUrl('ingredients/page'),
  },

  Measurements: {
    Base: getUrl('measurements'),
  },

  Dietitian: {
    Dietitian: `${apiUrl}/dietitian`,
    Collaboration: (dietitianId: number) => `${apiUrl}/dietitian/collaboration/${dietitianId}`,
  }
} as const;
