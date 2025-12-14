export interface NutrientGridItem {
  label: string;
  value: number;
  colorClass: string;
}

export interface DashboardCategory {
  name: string;
  subtitle: string;
  route: string;
  image: string;
}

export interface DailyNutrientTotals {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}
