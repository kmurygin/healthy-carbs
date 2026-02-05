import type {OnInit} from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import {CommonModule} from '@angular/common';
import type {FormArray, FormGroup} from '@angular/forms';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {debounceTime, distinctUntilChanged} from 'rxjs';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';

import {
  faBottleDroplet,
  faBreadSlice,
  faDrumstickBite,
  faFire,
  faPlus,
  faSave,
  faSpinner,
  faTimes,
  faTrash
} from '@fortawesome/free-solid-svg-icons';

import {RecipeService} from '@core/services/recipe/recipe.service';
import {NotificationService} from '@core/services/ui/notification.service';
import type {RecipeDto} from '@core/models/dto/recipe.dto';
import type {IngredientDto} from '@core/models/dto/ingredient.dto';
import type {RecipeIngredientDto} from '@core/models/dto/recipe-ingredient.dto';
import {MealType} from '@core/models/enum/meal-type.enum';
import {DietTypeService} from '@core/services/diet-type/diet-type.service';

@Component({
  selector: 'app-recipe-form',
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './recipes-management-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecipesManagementFormComponent implements OnInit {
  readonly recipeId = input<number | null>(null);
  readonly allIngredients = input<IngredientDto[] | null>(null);

  readonly closeOutputEmitter = output();
  readonly savedOutputEmitter = output();
  readonly isLoading = signal(false);
  readonly isEditMode = computed(() => !!this.recipeId());

  readonly dietTypes = signal<string[]>([]);
  readonly mealTypes = Object.values(MealType);
  protected readonly icons = {
    times: faTimes,
    save: faSave,
    plus: faPlus,
    trash: faTrash,
    spinner: faSpinner,
    fire: faFire,
    bread: faBreadSlice,
    drumstick: faDrumstickBite,
    droplet: faBottleDroplet
  };
  private readonly dietTypeService = inject(DietTypeService);
  private readonly recipeService = inject(RecipeService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);

  readonly formGroup = this.formBuilder.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    instructions: ['', Validators.required],
    dietType: ['STANDARD', Validators.required],
    mealType: [MealType.BREAKFAST, Validators.required],
    calories: [{value: 0, disabled: true}, [Validators.required, Validators.min(0)]],
    carbs: [{value: 0, disabled: true}, [Validators.required, Validators.min(0)]],
    protein: [{value: 0, disabled: true}, [Validators.required, Validators.min(0)]],
    fat: [{value: 0, disabled: true}, [Validators.required, Validators.min(0)]],
    ingredients: this.formBuilder.array([])
  });

  constructor() {
    this.dietTypeService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(types => {
      this.dietTypes.set(types.map(t => t.name));
    });
    effect(() => {
      const id = this.recipeId();
      if (id) this.loadRecipeData(id);
    });
  }

  get ingredientsArray(): FormArray {
    return this.formGroup.get('ingredients') as FormArray;
  }

  ngOnInit(): void {
    this.ingredientsArray.valueChanges
      .pipe(
        debounceTime(50),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.recalculateMacros();
      });
  }

  compareIngredients(ingredient1: IngredientDto | null, ingredient2: IngredientDto | null): boolean {
    return ingredient1 && ingredient2 ? ingredient1.id === ingredient2.id : ingredient1 === ingredient2;
  }

  addIngredient(): void {
    const ingredientGroup = this.formBuilder.group({
      id: [null],
      ingredient: [null as IngredientDto | null, Validators.required],
      quantity: [100, [Validators.required, Validators.min(0.1)]]
    });
    this.ingredientsArray.push(ingredientGroup);
  }

  removeIngredient(index: number): void {
    this.ingredientsArray.removeAt(index);
  }

  getUnit(index: number): string {
    const group = this.ingredientsArray.at(index) as FormGroup;
    const ingredient = group.get('ingredient')?.value as IngredientDto | null;
    return ingredient?.unit ?? '-';
  }

  onSubmit(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const formValue = this.formGroup.getRawValue();
    const currentRecipeId = this.recipeId();

    const ingredientsDto: RecipeIngredientDto[] = (formValue.ingredients as RecipeIngredientDto[])
      .map((item) => ({
        id: item.id,
        ingredient: item.ingredient,
        quantity: item.quantity,
        recipeId: currentRecipeId ?? undefined
      }));

    const recipeData: RecipeDto = {
      id: currentRecipeId ?? 0,
      name: formValue.name ?? '',
      description: formValue.description ?? '',
      instructions: formValue.instructions ?? '',
      dietType: formValue.dietType ?? 'STANDARD',
      mealType: formValue.mealType ?? MealType.BREAKFAST,
      calories: formValue.calories ?? 0,
      carbs: formValue.carbs ?? 0,
      protein: formValue.protein ?? 0,
      fat: formValue.fat ?? 0,
      ingredients: ingredientsDto,
      isFavourite: false,
      author: null,
      favouritesCount: 0
    };

    const request$ = this.isEditMode() && currentRecipeId
      ? this.recipeService.update(currentRecipeId, recipeData)
      : this.recipeService.create(recipeData);

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.savedOutputEmitter.emit();
        this.closeOutputEmitter.emit();
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        console.error(error);
        this.isLoading.set(false);
        const action = this.isEditMode() ? 'update' : 'create';
        this.notificationService.error(`Failed to ${action} recipe. Please try again.`);
      }
    });
  }

  onCancel(): void {
    this.closeOutputEmitter.emit();
  }

  private loadRecipeData(id: number): void {
    this.isLoading.set(true);
    this.formGroup.disable();

    this.recipeService.getById(id).subscribe({
      next: (recipe) => {
        this.patchForm(recipe);
        this.isLoading.set(false);
        this.formGroup.enable();
        this.disableMacroFields();
      },
      error: (err: unknown) => {
        console.error(err);
        this.isLoading.set(false);
        this.closeOutputEmitter.emit();
        this.notificationService.error('Failed to load recipe details.');
      }
    });
  }

  private patchForm(recipe: RecipeDto | null): void {
    if (!recipe) return;

    this.ingredientsArray.clear();

    if (recipe.ingredients.length) {
      recipe.ingredients.forEach(ri => {
        const group = this.formBuilder.group({
          id: [ri.id],
          ingredient: [ri.ingredient, Validators.required],
          quantity: [ri.quantity, [Validators.required, Validators.min(0.1)]]
        });
        this.ingredientsArray.push(group);
      });
    }

    this.formGroup.patchValue({
      name: recipe.name,
      description: recipe.description,
      instructions: recipe.instructions,
      dietType: recipe.dietType,
      mealType: recipe.mealType,
      calories: recipe.calories,
      carbs: recipe.carbs,
      protein: recipe.protein,
      fat: recipe.fat
    });
  }

  private recalculateMacros(): void {
    const ingredients = this.ingredientsArray.getRawValue();
    let cals = 0, carbs = 0, prot = 0, fat = 0;

    ingredients.forEach((item: RecipeIngredientDto) => {
      const ingredient = item.ingredient;
      const quantity = item.quantity || 0;

      if (quantity > 0) {
        const ratio = quantity;

        cals += (ingredient.caloriesPerUnit || 0) * ratio;
        carbs += (ingredient.carbsPerUnit || 0) * ratio;
        prot += (ingredient.proteinPerUnit || 0) * ratio;
        fat += (ingredient.fatPerUnit || 0) * ratio;
      }
    });

    this.formGroup.patchValue({
      calories: Math.round(cals),
      carbs: Math.round(carbs),
      protein: Math.round(prot),
      fat: Math.round(fat)
    }, {emitEvent: false});
  }

  private disableMacroFields(): void {
    this.formGroup.controls.calories.disable();
    this.formGroup.controls.carbs.disable();
    this.formGroup.controls.protein.disable();
    this.formGroup.controls.fat.disable();
  }
}
