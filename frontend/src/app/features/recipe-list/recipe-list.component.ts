import {ChangeDetectionStrategy, Component, computed, inject, signal,} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {RecipeService} from '../../core/services/recipe/recipe.service';
import type {RecipeDto} from '../../core/models/dto/recipe.dto';
import {toSignal} from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-recipe-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './recipe-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeListComponent {
  readonly nameFilter = signal('');
  readonly ingredientFilter = signal('');
  readonly dietFilter = signal('');
  readonly mealFilter = signal('');
  readonly page = signal(1);
  readonly pageSize = signal(6);
  readonly pageSizeOptions = [6, 9, 12];
  readonly startIndex = computed(() => (this.page() - 1) * this.pageSize());
  readonly dietTypes = signal(['BALANCED', 'VEGETARIAN', 'VEGAN', 'KETO']);
  readonly mealTypes = signal(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']);
  readonly total = computed(() => this.filtered().length);
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.total() / this.pageSize()))
  );
  readonly endIndex = computed(() =>
    Math.min(this.startIndex() + this.pageSize(), this.total())
  );
  readonly pageItems = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });
  private readonly recipeService = inject(RecipeService);
  readonly recipes = toSignal(
    this.recipeService.getAll(),
    {initialValue: [] as readonly RecipeDto[]}
  );
  readonly filtered = computed(() => {
    const recipes = this.recipes();
    const name = this.nameFilter().toLowerCase();
    const ingredient = this.ingredientFilter().toLowerCase();
    const diet = this.dietFilter();
    const meal = this.mealFilter();

    return recipes.filter(recipe => {
      const matchesName = recipe.name.toLowerCase().includes(name);
      const matchesIngredient = ingredient
        ? recipe.ingredients.some(recipeIngredient =>
          recipeIngredient.ingredient.name.toLowerCase().includes(ingredient)
        )
        : true;
      const matchesDiet = !diet || recipe.dietType === diet;
      const matchesMeal = !meal || recipe.mealType === meal;

      return matchesName && matchesIngredient && matchesDiet && matchesMeal;
    });
  });

  updateFilter(type: 'name' | 'ingredient' | 'diet' | 'meal', event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLSelectElement).value;
    switch (type) {
      case 'name':
        this.nameFilter.set(value);
        break;
      case 'ingredient':
        this.ingredientFilter.set(value);
        break;
      case 'diet':
        this.dietFilter.set(value);
        break;
      case 'meal':
        this.mealFilter.set(value);
        break;
    }
    this.page.set(1);
  }

  onPageSizeChange(event: Event): void {
    const value = parseInt((event.target as HTMLSelectElement).value, 10);
    this.pageSize.set(value);
    this.page.set(1);
  }

  nextPage(): void {
    if (this.page() < this.totalPages()) this.page.update(p => p + 1);
  }

  prevPage(): void {
    if (this.page() > 1) this.page.update(p => p - 1);
  }
}
