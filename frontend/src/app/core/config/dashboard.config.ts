import type {DashboardCategory} from "@core/models/dashboard.model";

export const DASHBOARD_CATEGORIES: DashboardCategory[] = [
  {
    name: 'Meal Plan',
    subtitle: 'Your weekly schedule',
    route: '/mealplan',
    image: 'assets/images/food_1.jpg'
  },
  {
    name: 'Recipes',
    subtitle: 'Discover new dishes',
    route: '/recipes',
    image: 'assets/images/food_3.jpg'
  },
  {
    name: 'Measurements',
    subtitle: 'Track your progress',
    route: '/user-measurements',
    image: 'assets/images/mierzenie.jpg'
  },
  {
    name: 'History',
    subtitle: 'Past diet plans',
    route: '/user/mealplan-history',
    image: 'assets/images/kalendarz-1.jpg'
  },
  {
    name: 'Diet Profile',
    subtitle: 'Adjust your goals',
    route: '/dietary-profile-form',
    image: 'assets/images/food_2.jpg'
  },
  {
    name: 'Premium',
    subtitle: 'Get expert help',
    route: '/dietitians',
    image: 'assets/images/dietetyk-kliniczny-1024x683.jpg'
  }
];
