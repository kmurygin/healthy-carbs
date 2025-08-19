export class DietaryProfileDto {
  id: number;
  userId: number;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  dietType: string;

  constructor(id: number, userId: number, calories: number, carbs: number) {
    this.id = id;
    this.userId = userId;
    this.calories = calories;
    this.carbs = carbs;
    this.protein = 0;
    this.fat = 0;
    this.dietType = '';
  }
}
