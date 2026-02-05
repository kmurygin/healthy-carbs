import type {UserDto} from "./user.dto";

export interface DietaryProfileDto {
  id: number;
  user: UserDto;
  weight: number;
  height: number;
  age: number;
  gender: string;
  dietGoal: string;
  dietType: string;
  activityLevel: string;
  calorieTarget: number;
  carbsTarget: number;
  proteinTarget: number;
  fatTarget: number;
}
