import type {InputSignal} from '@angular/core';
import {ChangeDetectionStrategy, Component, input} from '@angular/core';

@Component({
  selector: 'app-info-message',
  imports: [],
  template: `
    <div class="flex flex-col items-center justify-center gap-2 p-4 text-blue-600">
      <i class="fa-solid fa-circle-info text-2xl"></i>
      <p class="font-medium" role="status">{{ message() }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoMessageComponent {
  readonly message: InputSignal<string> = input.required<string>();
}
