import type {Option} from '@features/recipes-list/recipes-list.types';

export const RECIPE_SORT_OPTIONS_BASE: Option[] = [
  {value: 'name,asc', label: 'Name (A-Z)'},
  {value: 'name,desc', label: 'Name (Z-A)'},
  {value: 'calories,asc', label: 'Calories (Low to High)'},
  {value: 'calories,desc', label: 'Calories (High to Low)'},
];

export const RECIPE_SORT_OPTIONS_WITH_DEFAULT: Option[] = [
  {value: '', label: 'Default'},
  ...RECIPE_SORT_OPTIONS_BASE,
];

export const RECIPE_SORT_OPTIONS_WITH_POPULARITY: Option[] = [
  {value: '', label: 'Default'},
  {value: 'favouritesCount,desc', label: 'Most Popular'},
  {value: 'favouritesCount,asc', label: 'Least Popular'},
  ...RECIPE_SORT_OPTIONS_BASE,
];
