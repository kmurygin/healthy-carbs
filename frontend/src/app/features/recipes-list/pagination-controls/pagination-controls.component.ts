import {ChangeDetectionStrategy, Component, computed, input, output} from '@angular/core';

@Component({
  selector: 'app-pagination-controls',
  imports: [],
  templateUrl: './pagination-controls.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationControlsComponent {
  readonly pageNumber = input.required<number>();
  readonly totalPages = input.required<number>();

  readonly _pageNumber = computed(() => Math.max(this.pageNumber(), 1));
  readonly _totalPages = computed(() => Math.max(this.totalPages(), 1));

  readonly previousPage = output();
  readonly nextPage = output();

  readonly isFirstPage = computed(() => this.pageNumber() <= 1);
  readonly isLastPage = computed(() => this.pageNumber() >= this.totalPages());

  readonly buttonClasses = `
  flex items-center justify-center w-9 h-9 rounded-full border border-gray-300
  bg-white text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50
  disabled:cursor-not-allowed disabled:opacity-50 hover:cursor-pointer
  `;

  onPrevious(): void {
    if (!this.isFirstPage()) this.previousPage.emit();
  }

  onNext(): void {
    if (!this.isLastPage()) this.nextPage.emit();
  }
}
