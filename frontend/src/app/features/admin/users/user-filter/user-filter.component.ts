import {ChangeDetectionStrategy, Component, DestroyRef, inject, input, type OnInit, output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, type FormControl, type FormGroup, ReactiveFormsModule} from '@angular/forms';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faSearch} from '@fortawesome/free-solid-svg-icons';
import type {UserRole} from '@core/models/enum/user-role.enum';
import {debounceTime, distinctUntilChanged} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

export enum StatusFilter {
  ALL = 'ALL',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export enum RoleFilter {
  ALL = 'ALL'
}

export type RoleFilterValue = RoleFilter | UserRole;

export interface UserFilters {
  query: string;
  role: RoleFilterValue;
  status: StatusFilter;
}

type UserFilterForm = FormGroup<{
  query: FormControl<string>;
  role: FormControl<RoleFilterValue>;
  status: FormControl<StatusFilter>;
}>;

@Component({
  selector: 'app-user-filter',
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './user-filter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserFilterComponent implements OnInit {
  readonly roles = input.required<readonly UserRole[]>();
  readonly filterChange = output<UserFilters>();

  protected readonly searchIcon = faSearch;
  protected readonly StatusFilter = StatusFilter;
  protected readonly RoleFilter = RoleFilter;

  private readonly formBuilder = inject(FormBuilder);
  readonly form: UserFilterForm = this.formBuilder.group({
    query: this.formBuilder.control('', {nonNullable: true}),
    role: this.formBuilder.control<RoleFilterValue>(RoleFilter.ALL, {nonNullable: true}),
    status: this.formBuilder.control<StatusFilter>(StatusFilter.ALL, {nonNullable: true}),
  });
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.form.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.emitFilters();
    });
  }

  private emitFilters(): void {
    this.filterChange.emit(this.form.getRawValue());
  }
}
