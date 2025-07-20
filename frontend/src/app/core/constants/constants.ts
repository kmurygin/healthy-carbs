import { environment } from '../../../environments/environment';

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
    mealplan: `${apiUrl}/meal-plan`,
  }
};

export const LocalStorage = {
  token: "USER_TOKEN",
};
