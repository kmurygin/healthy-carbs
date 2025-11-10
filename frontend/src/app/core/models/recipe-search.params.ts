export interface RecipeSearchParams {
  page: number;
  size: number;
  name?: string;
  ingredient?: string;
  diet?: string;
  meal?: string;
  onlyFavourites?: boolean;
  sort?: string;
}
