import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {catchError, map, of, startWith, switchMap} from 'rxjs';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faExclamationCircle, faPlus, faSpinner, faTrash, faUtensils} from '@fortawesome/free-solid-svg-icons';
import {DietTypeService} from '@core/services/diet-type/diet-type.service';
import type {DietTypeDto} from '@core/models/dto/diet-type.dto';
import {AbstractManagementComponent} from '@shared/components/abstract-management/abstract-management.component';

@Component({
  selector: 'app-diet-types-management',
  imports: [CommonModule, FontAwesomeModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto max-w-3xl px-4 py-8">
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 tracking-tight">Diet Types Management</h2>
      </div>

      <div class="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-4 mb-6">
        <div class="flex justify-end">
          <button
            (click)="openCreate()"
            class="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold
            text-white shadow-sm hover:bg-emerald-700 transition-all hover:cursor-pointer
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 sm:w-auto w-full"
          >
            <fa-icon [icon]="icons.plus"></fa-icon>
            Add Diet Type
          </button>
        </div>
      </div>

      @if (isDataLoading()) {
        <div class="flex flex-col items-center justify-center gap-3 p-12 text-gray-500">
          <fa-icon [icon]="icons.spinner" class="text-3xl text-emerald-600 animate-spin"></fa-icon>
          <p class="font-medium animate-pulse">Loading diet types...</p>
        </div>
      } @else if (error()) {
        <div class="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-center gap-3">
          <fa-icon [icon]="icons.warn"></fa-icon>
          {{ error() }}
        </div>
      } @else if (allDietTypes().length === 0) {
        <div class="flex flex-col items-center justify-center gap-3 p-16 text-gray-400
          bg-white rounded-2xl border border-gray-200 border-dashed">
          <fa-icon [icon]="icons.utensils" class="text-4xl mb-2"></fa-icon>
          <p class="text-lg font-medium text-gray-600">No diet types found.</p>
          <p class="text-sm">Start by creating your first diet type!</p>
        </div>
      } @else {
        <div class="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compatibility
                Level
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (dt of allDietTypes(); track dt.id) {
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ dt.name }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ dt.compatibilityLevel }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      (click)="deleteItem(dt.id)"
                      class="text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <fa-icon [icon]="icons.trash"></fa-icon>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="mt-6 px-4 py-3 bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5">
          <p class="text-sm text-gray-500">
            Showing {{ allDietTypes().length }} diet types
          </p>
        </div>
      }

      @if (isFormOpen()) {
        <div
          (click)="onBackdropClick()"
          (keydown.escape)="onBackdropClick()"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          tabindex="0"
        >
          <div
            (click)="$event.stopPropagation()"
            (keydown.escape)="onBackdropClick()"
            class="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden"
            tabindex="-1"
          >
            <div class="bg-gray-50 px-6 py-4 border-b border-gray-100">
              <h3 class="font-semibold text-gray-900">Add New Diet Type</h3>
            </div>

            <div class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1" for="dietTypeName">Name</label>
                <input
                  [formControl]="nameControl"
                  class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 shadow-sm"
                  id="dietTypeName"
                  placeholder="e.g. KETO"
                  type="text"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1" for="compatibilityLevel">
                  Compatibility Level
                </label>
                <input
                  [formControl]="compatibilityLevelControl"
                  class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 shadow-sm"
                  id="compatibilityLevel"
                  placeholder="e.g. 1"
                  type="number"
                  min="1"
                />
                <p class="mt-1 text-xs text-gray-500">
                  Lower values are more restrictive. Types with lower or equal levels are considered compatible.
                </p>
              </div>
            </div>

            <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
              <button
                (click)="closeForm()"
                [disabled]="isSaving()"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300
                rounded-lg hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                (click)="save()"
                [disabled]="nameControl.invalid || compatibilityLevelControl.invalid || isSaving()"
                class="px-4 py-2 text-sm font-medium text-white bg-emerald-600
                rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center gap-2 cursor-pointer"
              >
                @if (isSaving()) {
                  <div class="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                }
                Save
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class DietTypesManagementComponent extends AbstractManagementComponent<DietTypeDto> {
  readonly nameControl = new FormControl('', {nonNullable: true, validators: [Validators.required]});
  readonly compatibilityLevelControl = new FormControl(1, {
    nonNullable: true,
    validators: [Validators.required, Validators.min(1)]
  });
  readonly isSaving = signal(false);
  protected readonly icons = {
    spinner: faSpinner,
    plus: faPlus,
    trash: faTrash,
    utensils: faUtensils,
    warn: faExclamationCircle
  };
  private readonly dietTypeService = inject(DietTypeService);
  private readonly refreshTrigger = signal(0);

  private readonly state = toSignal(
    toObservable(this.refreshTrigger).pipe(
      switchMap(() => this.dietTypeService.getAll().pipe(
        map(dietTypes => ({dietTypes, loading: false, error: null})),
        catchError((err: unknown) => {
          console.error('Diet type load error:', err);
          return of({
            dietTypes: [] as DietTypeDto[],
            loading: false,
            error: 'Failed to load diet types. Please try again later.'
          });
        })
      )),
      startWith({dietTypes: [] as DietTypeDto[], loading: true, error: null})
    ),
    {initialValue: {dietTypes: [] as DietTypeDto[], loading: true, error: null}}
  );

  readonly allDietTypes = computed(() => this.state().dietTypes);
  readonly isDataLoading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  override reloadData(): void {
    this.refreshTrigger.update(n => n + 1);
  }

  override deleteItem(id: number): void {
    this.confirmAndDelete(id, 'Diet Type', this.dietTypeService.delete(id));
  }

  onBackdropClick(): void {
    if (!this.isSaving()) {
      this.closeForm();
    }
  }

  save(): void {
    if (this.nameControl.invalid || this.compatibilityLevelControl.invalid) return;

    const name = this.nameControl.value.trim().toUpperCase();
    const compatibilityLevel = this.compatibilityLevelControl.value;
    if (!name) return;

    this.isSaving.set(true);
    this.nameControl.disable();
    this.compatibilityLevelControl.disable();

    this.dietTypeService.create({name, compatibilityLevel}).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.nameControl.enable();
        this.compatibilityLevelControl.enable();
        this.nameControl.reset();
        this.compatibilityLevelControl.reset(1);
        this.onSaveSuccess('Diet type created successfully');
      },
      error: () => {
        this.notificationService.error('Failed to create diet type');
        this.isSaving.set(false);
        this.nameControl.enable();
        this.compatibilityLevelControl.enable();
      }
    });
  }
}
