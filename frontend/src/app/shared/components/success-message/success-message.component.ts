import type {InputSignal} from '@angular/core';
import {ChangeDetectionStrategy, Component, input} from '@angular/core';

@Component({
  selector: 'app-success-message',
  imports: [],
  templateUrl: './success-message.component.html',
  styleUrl: './success-message.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuccessMessageComponent {
  readonly message: InputSignal<string> = input.required<string>();
}
