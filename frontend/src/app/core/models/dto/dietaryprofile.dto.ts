export interface DietaryProfileDto {
  id: number;
  userId: number;
  calorieTarget: number;
  carbsTarget: number;
  proteinTarget: number;
  fatTarget: number;
  weight: number;
  height: number;
  dietType: string;
}
