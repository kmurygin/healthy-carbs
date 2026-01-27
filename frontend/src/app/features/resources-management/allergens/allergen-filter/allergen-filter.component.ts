import {ChangeDetectionStrategy, Component, DestroyRef, inject, type OnInit, output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faSearch} from '@fortawesome/free-solid-svg-icons';
import {debounceTime, distinctUntilChanged} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-allergen-filter',
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  template: `
    <div class="relative">
      <fa-icon
        [icon]="searchIcon"
        class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      ></fa-icon>
      <input
        [formControl]="searchControl"
        class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-emerald-500
    focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
        placeholder="Search allergens..."
        type="text"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllergenFilterComponent implements OnInit {
  readonly searchChange = output<string>();
  readonly searchControl = new FormControl('', {nonNullable: true});
  protected readonly searchIcon = faSearch;
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(query => {
      this.searchChange.emit(query);
    });
  }
}
