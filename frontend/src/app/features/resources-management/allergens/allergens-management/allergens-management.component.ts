import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {catchError, map, of, startWith, switchMap} from 'rxjs';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faExclamationCircle, faPlus, faShieldAlt, faSpinner} from '@fortawesome/free-solid-svg-icons';
import {AllergenService} from '@core/services/allergen/allergen.service';
import type {AllergenDto} from '@core/models/dto/allergen.dto';
import {AbstractManagementComponent} from '@shared/components/abstract-management/abstract-management.component';
import {AllergensManagementTableComponent} from '../allergens-management-table/allergens-management-table.component';
import {
  AllergensManagementMobileListComponent
} from '../allergens-management-mobile-list/allergens-management-mobile-list.component';
import {AllergenFilterComponent} from '../allergen-filter/allergen-filter.component';
import {AllergensManagementFormComponent} from '../allergens-management-form/allergens-management-form.component';

@Component({
  selector: 'app-allergens-management',
  imports: [
    CommonModule,
    FontAwesomeModule,
    AllergensManagementTableComponent,
    AllergensManagementMobileListComponent,
    AllergenFilterComponent,
    AllergensManagementFormComponent
  ],
  templateUrl: './allergens-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllergensManagementComponent extends AbstractManagementComponent<AllergenDto> {
  protected readonly icons = {
    spinner: faSpinner,
    plus: faPlus,
    shield: faShieldAlt,
    warn: faExclamationCircle
  };
  private readonly allergenService = inject(AllergenService);
  private readonly searchQuery = signal('');
  private readonly refreshTrigger = signal(0);
  private readonly state = toSignal(
    toObservable(this.refreshTrigger).pipe(
      switchMap(() => this.allergenService.getAll().pipe(
        map(allergens => ({allergens, loading: false, error: null})),
        catchError((err: unknown) => {
          console.error('Allergen load error:', err);
          return of({
            allergens: [] as AllergenDto[],
            loading: false,
            error: 'Failed to load allergens. Please try again later.'
          });
        })
      )),
      startWith({allergens: [] as AllergenDto[], loading: true, error: null})
    ),
    {initialValue: {allergens: [] as AllergenDto[], loading: true, error: null}}
  );
  readonly allAllergens = computed(() => this.state().allergens);
  readonly totalElements = computed(() => this.allAllergens().length);
  readonly filteredAllergens = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const allAllergens = this.allAllergens();

    if (!query) return allAllergens;
    return allAllergens.filter(a => a.name.toLowerCase().includes(query));
  });
  readonly isDataLoading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  override reloadData(): void {
    this.refreshTrigger.update(n => n + 1);
  }

  override deleteItem(id: number): void {
    this.confirmAndDelete(id, 'Allergen', this.allergenService.delete(id));
  }

  handleSearch(query: string): void {
    this.searchQuery.set(query);
  }
}
