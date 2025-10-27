import {DietType} from "../core/models/enum/diet-type.enum";

export function formatEnum(value: string): string {
  return value
    .toLowerCase()
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

export function getDietTagClasses(dietType: DietType): string {
  const baseClasses = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium';

  switch (dietType) {
    case DietType.VEGETARIAN:
    case DietType.VEGAN:
      return `${baseClasses} bg-green-100 text-green-800`;
    default:
      return `${baseClasses} bg-blue-100 text-blue-800`;
  }
}
