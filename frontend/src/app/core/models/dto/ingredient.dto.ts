export class IngredientDto {
  id: number;
  name: string;
  unit: string;
  caloriesPerUnit: number;
  carbsPerUnit: number;
  proteinPerUnit: number;
  fatPerUnit: number;

  constructor(id: number, name: string, unit: string, caloriesPerUnit: number) {
    this.id = id;
    this.name = name;
    this.unit = unit;
    this.caloriesPerUnit = caloriesPerUnit;
    this.carbsPerUnit = 0;
    this.proteinPerUnit = 0;
    this.fatPerUnit = 0;
  }
}
