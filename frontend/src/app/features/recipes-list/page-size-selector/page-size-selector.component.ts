import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';

@Component({
  selector: 'app-page-size-selector',
  imports: [],
  templateUrl: './page-size-selector.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageSizeSelectorComponent {
  readonly pageSize = input.required<number>();
  readonly pageSizeOptions = input.required<readonly number[]>();

  pageSizeChange = output<number>();

  onPageSizeChange(newSize: number): void {
    this.pageSizeChange.emit(newSize);
  }
}
