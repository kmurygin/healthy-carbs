export interface AllergenDto {
  readonly id: number;
  readonly name: string;
  readonly author: { id: number } | null;
}
