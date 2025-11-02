import {environment} from '../../../environments/environment';

const apiUrl = environment.apiUrl;

export const ApiEndpoints = {
  Auth: {
    Register: `${apiUrl}/auth/register`,
    Login: `${apiUrl}/auth/authenticate`,
  },

  User: {
    User: `${apiUrl}/users/`,
    GetUserByUsername: `${apiUrl}/users/username/`,
    ChangePassword: `${apiUrl}/users/change-password`,
  },

  MealPlan: {
    userprofile: `${apiUrl}/meal-plan/userprofile`,
    mealplan: `${apiUrl}/mealplan`,
  },

  Payment: {
    Create: `${apiUrl}/payments/payu/create`,
    Status: `${apiUrl}/payments/payu/status/`,
    Order: `${apiUrl}/payments/payu/order/`,
  },

  Recipes: {
    Recipes: `${apiUrl}/recipes`,
  },

  DietaryProfiles: {
    DietaryProfiles: `${apiUrl}/dietary-profiles`,
  },

  ShoppingList: {
    Get: (mealPlanId: number) => `${apiUrl}/shopping-list/${mealPlanId}`,
    UpdateItem: (mealPlanId: number) => `${apiUrl}/shopping-list/${mealPlanId}/item`,
    Download: (mealPlanId: number) => `${apiUrl}/shopping-list/${mealPlanId}/download`,
  },
};
