import {IngredientCategory} from "../models/IngredientCategory";

export const CategoryIconMap: Readonly<Record<IngredientCategory, string>> = {
  [IngredientCategory.VEGETABLES]: 'fa-carrot',
  [IngredientCategory.FRUITS]: 'fa-apple-whole',
  [IngredientCategory.MEAT]: 'fa-drumstick-bite',
  [IngredientCategory.FISH]: 'fa-fish',
  [IngredientCategory.DAIRY]: 'fa-cow',
  [IngredientCategory.GRAINS]: 'fa-wheat-awn',
  [IngredientCategory.LEGUMES]: 'fa-seedling',
  [IngredientCategory.NUTS_AND_SEEDS]: 'fa-seedling',
  [IngredientCategory.OIL_AND_FATS]: 'fa-bottle-droplet',
  [IngredientCategory.SPICES]: 'fa-mortar-pestle',
  [IngredientCategory.SWEETS]: 'fa-cake-candles',
  [IngredientCategory.BEVERAGES]: 'fa-mug-saucer',
  [IngredientCategory.OTHER]: 'fa-box-open',
};
