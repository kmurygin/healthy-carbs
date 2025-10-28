import {DietType} from "../core/models/enum/diet-type.enum";

export function formatEnum(value: string): string {
  return value
    .toLowerCase()
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

const baseClasses = 'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium';

type Size = 'sm' | 'xs';

const sizeClasses: Record<Size, string> = {
  'sm': 'px-3 py-1 text-sm font-medium',
  'xs': 'px-2.5 py-0.5 text-xs font-medium',
}

export function getDietTagClasses(
  dietType: DietType | undefined,
  size: Size = 'sm',
): string {

  const sizeCategory = sizeClasses[size];
  switch (dietType) {
    case DietType.VEGETARIAN:
    case DietType.VEGAN:
      return `${baseClasses} ${sizeCategory} bg-emerald-100 text-emerald-800`;
    default:
      return `${baseClasses} ${sizeCategory} bg-orange-100 text-orange-800`;
  }
}

export function getDietTagIconClasses(dietType: DietType | undefined) {
  switch (dietType) {
    case DietType.VEGETARIAN:
    case DietType.VEGAN:
      return 'fa-solid fa-leaf';
    default:
      return 'fa-solid fa-drumstick-bite';
  }
}

export function getMealTagClasses(size: Size = 'sm'): string {
  const sizeCategory = sizeClasses[size];
  return `${sizeCategory} inline-flex items-center gap-1.5 rounded-full
  bg-blue-100 px-3 py-1 text-blue-800`;
}
