import {ChangeDetectionStrategy, Component, computed, effect, input, output, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CategoryIconMap} from "@core/constants/category-icon.map";
import type {ShoppingList} from "@core/models/dto/shopping-list.dto";
import {IngredientCategory} from "@core/models/enum/ingredient-category.enum";
import type {UpdateShoppingListItemPayload} from "@core/models/payloads/updateshoppinglistitem.payload";
import {formatEnum} from "@shared/utils";

type DisplayItem = Readonly<{
  id: string;
  name: string;
  unit: string;
  quantity: number;
  category: IngredientCategory;
  isBought: boolean;
}>;

@Component({
  selector: 'app-meal-plan-shopping-list',
  imports: [CommonModule],
  templateUrl: './meal-plan-shopping-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MealPlanShoppingListComponent {
  readonly shoppingList = input<ShoppingList | null>(null);
  readonly loading = input<boolean>(false);
  readonly error = input<string | null>(null);
  readonly updatingItemId = input<string | null>(null);
  readonly toggleItem = output<UpdateShoppingListItemPayload>();
  readonly openCategories = signal(new Set<string>());
  readonly items = computed(() => this.transformDtoToDisplayItems(this.shoppingList()));
  readonly groupedItems = computed(() => {
    const itemsByCategory = new Map<IngredientCategory, DisplayItem[]>();
    for (const item of this.items()) {
      const category = item.category;
      const categoryItems = itemsByCategory.get(category) ?? [];
      categoryItems.push(item);
      itemsByCategory.set(category, categoryItems);
    }
    const entriesWithSortedItems = Array.from(itemsByCategory.entries()).map(([category, items]) => {
      const sortedItems = [...items].sort((a, b) => a.name.localeCompare(b.name));
      return [category, sortedItems] as const;
    });
    return entriesWithSortedItems.sort((a, b) => a[0].localeCompare(b[0]));
  });
  readonly isEmpty = computed(() => !this.loading() && !this.error() && this.items().length === 0);
  protected readonly formatEnum = formatEnum;

  constructor() {
    effect(() => {
      const allCategories = new Set(this.items().map(item => item.category));
      this.openCategories.set(allCategories);
    });
  }

  toggleCategory(category: string): void {
    this.openCategories.update(currentSet => {
      const newSet = new Set(currentSet);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  }

  toggleCheck(item: DisplayItem): void {
    if (this.updatingItemId()) return;

    const payload: UpdateShoppingListItemPayload = {
      ingredientName: item.name,
      isBought: !item.isBought,
    };

    this.toggleItem.emit(payload);
  }

  isIngredientCategory(value: string): value is IngredientCategory {
    return value in IngredientCategory;
  }

  iconFor(category: IngredientCategory): string {
    const key = category.toUpperCase().trim();
    if (this.isIngredientCategory(key)) {
      return CategoryIconMap[key];
    }
    return CategoryIconMap[IngredientCategory.OTHER];
  }

  private transformDtoToDisplayItems(inputShoppingList: ShoppingList | null): readonly DisplayItem[] {
    if (!inputShoppingList) return [];

    const displayItems: DisplayItem[] = [];
    const categories = Object.keys(inputShoppingList.items) as IngredientCategory[];

    for (const category of categories) {

      const categoryItems = inputShoppingList.items[category];

      for (const item of categoryItems) {
        const unit = item.unit || 'piece';
        displayItems.push({
          id: `${category}-${item.name}`,
          name: item.name,
          quantity: item.totalQuantity,
          unit: unit.endsWith('s') ? unit : `${unit}s`,
          category: category,
          isBought: item.isBought,
        });
      }
    }
    return displayItems;
  }
}
