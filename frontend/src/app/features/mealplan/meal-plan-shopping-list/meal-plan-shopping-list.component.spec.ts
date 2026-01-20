import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';

import {MealPlanShoppingListComponent} from './meal-plan-shopping-list.component';
import {IngredientCategory} from "@core/models/enum/ingredient-category.enum";
import type {ShoppingList} from "@core/models/dto/shopping-list.dto";

describe('MealPlanShoppingListComponent', () => {
  let component: MealPlanShoppingListComponent;
  let fixture: ComponentFixture<MealPlanShoppingListComponent>;

  const mockShoppingList: ShoppingList = {
    items: {
      [IngredientCategory.VEGETABLES]: [
        {name: 'Carrot', totalQuantity: 2, unit: 'pcs', isBought: false},
        {name: 'Onion', totalQuantity: 1, unit: 'kg', isBought: true}
      ],
      [IngredientCategory.FRUITS]: [
        {name: 'Apple', totalQuantity: 5, unit: 'pcs', isBought: false}
      ]
    } as any
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealPlanShoppingListComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MealPlanShoppingListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('shoppingList', mockShoppingList);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should transform DTO to display items', () => {
    const items = component.items();
    expect(items.length).toBe(3);

    const carrot = items.find(item => item.name === 'Carrot');
    expect(carrot).toBeDefined();
    expect(carrot?.category).toBe(IngredientCategory.VEGETABLES);
    expect(carrot?.quantity).toBe(2);
  });

  it('should group items and sort categories', () => {
    const grouped = component.groupedItems();

    expect(grouped.length).toBe(2);
    expect(grouped[0][0]).toBe(IngredientCategory.FRUITS);
    expect(grouped[1][0]).toBe(IngredientCategory.VEGETABLES);
  });

  it('should sort items within category alphabetically', () => {
    const grouped = component.groupedItems();
    const vegGroup = grouped.find(group => group[0] === IngredientCategory.VEGETABLES);

    expect(vegGroup).toBeDefined();
    const vegItems = vegGroup![1];
    expect(vegItems[0].name).toBe('Carrot');
    expect(vegItems[1].name).toBe('Onion');
  });

  it('should emit toggleItem event', () => {
    spyOn(component.toggleItem, 'emit');

    const carrotDisplayItem = component.items().find(item => item.name === 'Carrot')!;
    component.toggleCheck(carrotDisplayItem);

    expect(component.toggleItem.emit).toHaveBeenCalledWith({
      ingredientName: 'Carrot',
      isBought: true
    });
  });

  it('should not emit if updating', () => {
    spyOn(component.toggleItem, 'emit');
    fixture.componentRef.setInput('updatingItemId', 'VEGETABLES-Carrot');
    fixture.detectChanges();

    const carrotDisplayItem = component.items().find(item => item.name === 'Carrot')!;
    component.toggleCheck(carrotDisplayItem);

    expect(component.toggleItem.emit).not.toHaveBeenCalled();
  });

  it('should toggle category visibility', () => {
    const category = IngredientCategory.VEGETABLES;

    expect(component.openCategories().has(category)).toBeTrue();

    component.toggleCategory(category);
    expect(component.openCategories().has(category)).toBeFalse();

    component.toggleCategory(category);
    expect(component.openCategories().has(category)).toBeTrue();
  });
});
