import {ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, output,} from '@angular/core';

import {FormBuilder, ReactiveFormsModule} from '@angular/forms';
import {debounceTime, distinctUntilChanged, map} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import type {DietType} from '@core/models/enum/diet-type.enum';
import type {MealType} from '@core/models/enum/meal-type.enum';
import {formatEnum} from '@shared/utils';
import type {Option, RecipeFilters} from "@features/recipes-list/recipes-list.types";

interface TextField {
  inputType: 'text';
  controlName: 'name' | 'ingredient';
  label: string;
  placeholder: string;
  icon: string;
  input_mode?: 'text' | 'search' | 'numeric' | 'decimal' | 'email';
}

interface SelectField {
  inputType: 'select';
  controlName: 'diet' | 'meal' | 'sort';
  label: string;
  icon: string;
  options: () => readonly Option[];
}

type Field = TextField | SelectField;

@Component({
  selector: 'app-recipe-filter',
  imports: [ReactiveFormsModule],
  templateUrl: './recipe-filter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeFilterComponent {
  readonly dietTypes = input.required<DietType[]>();
  readonly mealTypes = input.required<MealType[]>();
  readonly sortOptions = input.required<Option[]>();
  readonly debounceMs = input<number>(150);

  readonly filterChange = output<RecipeFilters>();
  readonly sortSelectOptions = computed<readonly Option[]>(() =>
    this.sortOptions().map(o => ({value: o.value, label: o.label})),
  );
  readonly fields: readonly Field[] = [
    {
      inputType: 'text',
      controlName: 'name',
      label: 'Search by name',
      placeholder: 'e.g. pizza',
      icon: 'fa-solid fa-magnifying-glass',
      input_mode: 'search',
    },
    {
      inputType: 'text',
      controlName: 'ingredient',
      label: 'Search by ingredient',
      placeholder: 'e.g. tomato',
      icon: 'fa-solid fa-carrot',
      input_mode: 'search',
    },
    {
      inputType: 'select',
      controlName: 'diet',
      label: 'Diet type',
      icon: 'fa-solid fa-seedling',
      options: () => this.dietOptions(),
    },
    {
      inputType: 'select',
      controlName: 'meal',
      label: 'Meal type',
      icon: 'fa-solid fa-plate-wheat',
      options: () => this.mealOptions(),
    },
    {
      inputType: 'select',
      controlName: 'sort',
      label: 'Sort by',
      icon: 'fa-solid fa-arrow-down-wide-short',
      options: () => this.sortSelectOptions(),
    },
  ] as const;
  protected readonly controlClass = `
  px-3 py-2 rounded-xl border border-gray-300 bg-white
  focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600
  focus:outline-none focus-visible:outline-none ring-0
  `;
  protected readonly formatEnum = formatEnum;
  readonly dietOptions = computed<readonly Option[]>(() => [
    {value: '', label: 'All'},
    ...this.dietTypes().map(dietType => ({value: dietType, label: this.formatEnum(dietType)})),
  ]);
  readonly mealOptions = computed<readonly Option[]>(() => [
    {value: '', label: 'All'},
    ...this.mealTypes().map(mealType => ({value: mealType, label: this.formatEnum(mealType)})),
  ]);
  private readonly formBuilder = inject(FormBuilder);
  protected readonly formGroup = this.formBuilder.nonNullable
    .group<RecipeFilters>({
      name: '',
      ingredient: '',
      diet: '' as '' | DietType,
      meal: '' as '' | MealType,
      sort: '',
    });
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.formGroup.valueChanges
      .pipe(
        debounceTime(this.debounceMs()),
        map(() => this.formGroup.getRawValue()),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(values => {
        this.filterChange.emit(values);
      });
  }

  onSubmit(): void {
    this.filterChange.emit(this.formGroup.getRawValue());
  }
}
