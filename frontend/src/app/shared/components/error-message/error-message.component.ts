import type {InputSignal} from '@angular/core';
import {ChangeDetectionStrategy, Component, input} from '@angular/core';

@Component({
  selector: 'app-error-message',
  imports: [],
  templateUrl: './error-message.component.html',
  styleUrl: './error-message.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorMessageComponent {
  readonly message: InputSignal<string> = input.required<string>();
}
