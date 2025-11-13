import {ChangeDetectionStrategy, Component, input} from '@angular/core';

@Component({
  selector: 'app-loading-message',
  imports: [],
  template: `
    <div class="text-xl font-bold tracking-tight text-gray-900 leading-tight text-center p-16">
      <i class="fa-solid fa-spinner fa-spin"></i>
      @if (  message() !== null ) {
        {{ message() }}
      }
      @else {
        Loading, please wait...
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingMessageComponent {
  readonly message = input<string | null>(null);
}
