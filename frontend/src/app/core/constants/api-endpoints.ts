import {environment} from '../../../environments/environment';

const getUrl = (path: string) => `${environment.apiUrl}/${path}`;

export const ApiEndpoints = {
  Auth: {
    Base: getUrl('auth'),
    Register: getUrl('auth/register'),
    Login: getUrl('auth/authenticate'),
    ForgotPassword: getUrl('auth/forgot-password'),
    VerifyOtp: getUrl('auth/verify-otp'),
    ResetPassword: getUrl('auth/reset-password'),
    Refresh: getUrl('auth/refresh'),
    Logout: getUrl('auth/logout'),
  },

  User: {
    Base: getUrl('users/'),
    GetByUsername: getUrl('users/username/'),
    ChangePassword: getUrl('users/change-password'),
  },

  Admin: {
    Users: {
      Base: getUrl('admin/users/'),
      GetAll: getUrl('admin/users'),
    },
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

  MealPlanTemplates: {
    Base: getUrl('mealplan-templates'),
  },

  Ingredients: {
    Base: getUrl('ingredients'),
    Page: getUrl('ingredients/page'),
  },

  Measurements: {
    Base: getUrl('measurements'),
  },

  Allergens: {
    Base: getUrl('allergens'),
  },

  Dietitian: {
    Base: getUrl('dietitian'),
    Collaboration: (dietitianId: number) => getUrl(`dietitian/collaboration/${dietitianId}`),
    MyCollaborations: getUrl('dietitian/my-collaborations'),
  },

  Email: {
    Contact: getUrl('mails/contact'),
  },

  DietTypes: {
    Base: getUrl('diet-types'),
  },

  Blog: {
    Base: getUrl('blog'),
    Post: (postId: number) => getUrl(`blog/${postId}`),
    AddComment: (postId: number) => getUrl(`blog/${postId}/comments`),
    DeleteComment: (commentId: number) => getUrl(`blog/comments/${commentId}`),
    UploadImage: (postId: number) => getUrl(`blog/${postId}/image`),
    GetImage: (imageId: number) => getUrl(`blog/images/${imageId}`),
  }
} as const;
