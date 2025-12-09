import {ChangeDetectionStrategy, Component, effect, inject, input, output, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {IngredientService} from '@core/services/ingredient/ingredient.service';
import {CommonModule} from '@angular/common';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faSave, faSpinner, faTimes} from '@fortawesome/free-solid-svg-icons';
import type {IngredientDto} from '@core/models/dto/ingredient.dto';
import {IngredientCategory} from '@core/models/enum/ingredient-category.enum';

@Component({
  selector: 'app-ingredients-management-form',
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './ingredients-management-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IngredientsManagementFormComponent {
  readonly ingredientId = input<number | null>(null);
  readonly closeOutputEmitter = output();
  readonly savedOutputEmitter = output<string>();

  readonly isLoading = signal(false);
  readonly categories = Object.values(IngredientCategory);

  protected readonly icons = {
    times: faTimes,
    save: faSave,
    spinner: faSpinner
  };

  private readonly formBuilder = inject(FormBuilder);
  readonly formGroup = this.formBuilder.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    unit: ['g', Validators.required],
    category: [IngredientCategory.VEGETABLES, Validators.required],
    caloriesPerUnit: [0, [Validators.required, Validators.min(0)]],
    carbsPerUnit: [0, [Validators.required, Validators.min(0)]],
    proteinPerUnit: [0, [Validators.required, Validators.min(0)]],
    fatPerUnit: [0, [Validators.required, Validators.min(0)]],
  });
  private readonly ingredientService = inject(IngredientService);

  constructor() {
    effect(() => {
      const id = this.ingredientId();
      if (id) {
        this.loadData(id);
      } else {
        this.formGroup.reset({
          unit: 'g',
          category: IngredientCategory.VEGETABLES,
          caloriesPerUnit: 0,
          carbsPerUnit: 0,
          proteinPerUnit: 0,
          fatPerUnit: 0
        });
      }
    });
  }

  onCancel() {
    this.closeOutputEmitter.emit();
  }

  onSubmit() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const dto = this.formGroup.getRawValue() as unknown as IngredientDto;
    const id = this.ingredientId();

    const request$ = id
      ? this.ingredientService.update(id, dto)
      : this.ingredientService.create(dto);

    request$.subscribe({
      next: () => {
        this.isLoading.set(false);
        this.savedOutputEmitter.emit(id ? 'Ingredient updated' : 'Ingredient created');
        this.closeOutputEmitter.emit();
      },
      error: (err: unknown) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  private loadData(id: number) {
    this.isLoading.set(true);
    this.formGroup.disable();

    this.ingredientService.getById(id).subscribe({
      next: (data) => {
        if (data) {
          this.formGroup.patchValue({
            name: data.name,
            unit: data.unit,
            category: data.category,
            caloriesPerUnit: data.caloriesPerUnit,
            carbsPerUnit: data.carbsPerUnit,
            proteinPerUnit: data.proteinPerUnit,
            fatPerUnit: data.fatPerUnit
          });
        }
        this.isLoading.set(false);
        this.formGroup.enable();
      },
      error: (err: unknown) => {
        console.error('Failed to load ingredient', err);
        this.isLoading.set(false);
        this.formGroup.enable();
        this.closeOutputEmitter.emit();
      }
    });
  }
}
