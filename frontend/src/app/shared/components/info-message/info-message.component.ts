import type {InputSignal} from '@angular/core';
import {ChangeDetectionStrategy, Component, input} from '@angular/core';

@Component({
  selector: 'app-info-message',
  imports: [],
  templateUrl: './info-message.component.html',
  styleUrl: './info-message.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoMessageComponent {
  readonly message: InputSignal<string> = input.required<string>();
}
