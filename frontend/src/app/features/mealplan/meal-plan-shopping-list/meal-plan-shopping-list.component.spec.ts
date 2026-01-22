import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';

import {MealPlanShoppingListComponent} from './meal-plan-shopping-list.component';
import {IngredientCategory} from "@core/models/enum/ingredient-category.enum";
import type {ShoppingList} from "@core/models/dto/shopping-list.dto";
import {createMockShoppingList} from "@testing/test-data.util";

describe('MealPlanShoppingListComponent', () => {
  let component: MealPlanShoppingListComponent;
  let fixture: ComponentFixture<MealPlanShoppingListComponent>;

  let mockShoppingList: ShoppingList;

  beforeEach(async () => {
    const baseItems = createMockShoppingList().items;
    mockShoppingList = {
      items: {
        ...baseItems,
        [IngredientCategory.VEGETABLES]: [
          {name: 'Carrot', totalQuantity: 2, unit: 'pcs', isBought: false},
          {name: 'Onion', totalQuantity: 1, unit: 'kg', isBought: true}
        ],
        [IngredientCategory.FRUITS]: [
          {name: 'Apple', totalQuantity: 5, unit: 'pcs', isBought: false}
        ]
      }
    };

    await TestBed.configureTestingModule({
      imports: [MealPlanShoppingListComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MealPlanShoppingListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('shoppingList', mockShoppingList);
    fixture.detectChanges();
  });

  it('component_whenCreated_shouldBeTruthy', () => {
    expect(component).toBeTruthy();
  });

  it('items_whenShoppingListProvided_shouldFlattenItems', () => {
    const items = component.items();
    expect(items.length).toBe(3);

    const carrot = items.find(item => item.name === 'Carrot');
    expect(carrot).toBeDefined();
    expect(carrot?.category).toBe(IngredientCategory.VEGETABLES);
    expect(carrot?.quantity).toBe(2);
  });

  it('groupedItems_whenComputed_shouldSortCategories', () => {
    const grouped = component.groupedItems();

    expect(grouped.length).toBe(2);
    expect(grouped[0][0]).toBe(IngredientCategory.FRUITS);
    expect(grouped[1][0]).toBe(IngredientCategory.VEGETABLES);
  });

  it('groupedItems_whenComputed_shouldSortItemsWithinCategory', () => {
    const grouped = component.groupedItems();
    const vegGroup = grouped.find(group => group[0] === IngredientCategory.VEGETABLES);

    expect(vegGroup).toBeDefined();
    const vegItems = vegGroup![1];
    expect(vegItems[0].name).toBe('Carrot');
    expect(vegItems[1].name).toBe('Onion');
  });

  it('toggleCheck_whenCalled_shouldEmitToggleItem', () => {
    spyOn(component.toggleItem, 'emit');

    const carrotDisplayItem = component.items().find(item => item.name === 'Carrot')!;
    component.toggleCheck(carrotDisplayItem);

    expect(component.toggleItem.emit).toHaveBeenCalledWith({
      ingredientName: 'Carrot',
      isBought: true
    });
  });

  it('toggleCheck_whenUpdating_shouldNotEmit', () => {
    spyOn(component.toggleItem, 'emit');
    fixture.componentRef.setInput('updatingItemId', 'VEGETABLES-Carrot');
    fixture.detectChanges();

    const carrotDisplayItem = component.items().find(item => item.name === 'Carrot')!;
    component.toggleCheck(carrotDisplayItem);

    expect(component.toggleItem.emit).not.toHaveBeenCalled();
  });

  it('toggleCategory_whenCalled_shouldToggleVisibility', () => {
    const category = IngredientCategory.VEGETABLES;

    expect(component.openCategories().has(category)).toBeTrue();

    component.toggleCategory(category);
    expect(component.openCategories().has(category)).toBeFalse();

    component.toggleCategory(category);
    expect(component.openCategories().has(category)).toBeTrue();
  });
});
