import {ChangeDetectionStrategy, Component, computed, inject, input, output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, ReactiveFormsModule} from '@angular/forms';
import {debounceTime, distinctUntilChanged, map, startWith, switchMap} from 'rxjs';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import type {DietType} from '@core/models/enum/diet-type.enum';
import type {MealType} from '@core/models/enum/meal-type.enum';
import {formatEnum} from '@shared/utils';
import type {Option, RecipeFilters} from '@features/recipes-list/recipes-list.types';

type FilterFormValue = Readonly<{
  name: string;
  ingredient: string;
  diet: DietType | '';
  meal: MealType | '';
  sort: string;
}>;

function isFilterFormIdentical(
  previousValue: FilterFormValue,
  nextValue: FilterFormValue
): boolean {
  return (
    previousValue.name === nextValue.name &&
    previousValue.ingredient === nextValue.ingredient &&
    previousValue.diet === nextValue.diet &&
    previousValue.meal === nextValue.meal &&
    previousValue.sort === nextValue.sort
  );
}

@Component({
  selector: 'app-meal-plan-recipe-filter',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './meal-plan-recipe-filter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MealPlanRecipeFilterComponent {
  readonly dietTypes = input.required<readonly DietType[]>();
  readonly mealTypes = input.required<readonly MealType[]>();
  readonly sortOptions = input.required<readonly Option[]>();
  readonly inputDelayMs = input(100);

  readonly filterChange = output<RecipeFilters>();
  protected readonly formatEnum = formatEnum;
  readonly dietOptions = computed<readonly Option[]>(() => [
    {value: '', label: 'All diet types'},
    ...this.dietTypes().map((dietType) => ({value: dietType, label: this.formatEnum(dietType)})),
  ]);
  readonly mealOptions = computed<readonly Option[]>(() => [
    {value: '', label: 'All meal types'},
    ...this.mealTypes().map((mealType) => ({value: mealType, label: this.formatEnum(mealType)})),
  ]);
  private readonly formBuilder = inject(FormBuilder);
  readonly formGroup = this.formBuilder.nonNullable.group<FilterFormValue>({
    name: '',
    ingredient: '',
    diet: '',
    meal: '',
    sort: '',
  });

  constructor() {
    toObservable(this.inputDelayMs)
      .pipe(
        switchMap((debounceMilliseconds) =>
          this.formGroup.valueChanges.pipe(
            startWith(this.formGroup.getRawValue()),
            debounceTime(debounceMilliseconds),
            map(() => this.formGroup.getRawValue()),
            distinctUntilChanged(isFilterFormIdentical)
          )
        ),
        takeUntilDestroyed()
      )
      .subscribe((formValue) => {
        this.filterChange.emit(formValue as unknown as RecipeFilters);
      });
  }
}
