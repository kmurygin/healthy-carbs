import type {InputSignal} from '@angular/core';
import {ChangeDetectionStrategy, Component, input} from '@angular/core';

@Component({
  selector: 'app-error-message',
  imports: [],
  template: `
    <div class="flex flex-col items-center justify-center gap-2 p-4 text-red-600">
      <i class="fa-solid fa-triangle-exclamation text-2xl"></i>
      <p class="font-medium" role="alert">{{ message() }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorMessageComponent {
  readonly message: InputSignal<string> = input.required<string>();
}
