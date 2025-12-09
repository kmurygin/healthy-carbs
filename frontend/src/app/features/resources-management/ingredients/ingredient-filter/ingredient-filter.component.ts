import {ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, output} from '@angular/core';
import {FormBuilder, ReactiveFormsModule} from '@angular/forms';
import {debounceTime, distinctUntilChanged, map} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import type {IngredientCategory} from '@core/models/enum/ingredient-category.enum';
import {formatEnum} from '@shared/utils';

export interface FilterOption {
  value: string | number | null;
  label: string;
}

export interface IngredientFilters {
  name: string;
  category: IngredientCategory | null;
  onlyMine: boolean;
}

@Component({
  selector: 'app-ingredient-filter',
  imports: [ReactiveFormsModule],
  templateUrl: './ingredient-filter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IngredientFilterComponent {
  readonly categories = input.required<IngredientCategory[]>();
  readonly debounceMs = input<number>(300);

  readonly filterChange = output<IngredientFilters>();
  readonly categoryOptions = computed<readonly FilterOption[]>(() => [
    {value: null, label: 'All Categories'},
    ...this.categories().map(category => ({
      value: category,
      label: formatEnum(category)
    }))
  ]);
  protected readonly controlClass = `
    px-3 py-2 rounded-xl border border-gray-300 bg-white
    focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600
    focus:outline-none focus-visible:outline-none ring-0 w-full
  `;
  private readonly formBuilder = inject(FormBuilder);
  protected readonly formGroup = this.formBuilder.group({
    name: [''],
    category: [null as IngredientCategory | null],
    onlyMine: [false]
  });
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.formGroup.valueChanges
      .pipe(
        debounceTime(this.debounceMs()),
        map(() => this.formGroup.getRawValue()),
        distinctUntilChanged((previous, current) => JSON.stringify(previous) === JSON.stringify(current)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(values => {
        this.filterChange.emit(values as IngredientFilters);
      });
  }

  onSubmit(): void {
    this.filterChange.emit(this.formGroup.getRawValue() as IngredientFilters);
  }
}
