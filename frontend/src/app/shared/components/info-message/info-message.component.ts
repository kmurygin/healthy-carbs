import {Component, input, InputSignal} from '@angular/core';

@Component({
  selector: 'info-message',
  imports: [],
  templateUrl: './info-message.component.html',
  styleUrl: './info-message.component.css'
})
export class InfoMessageComponent {
  message: InputSignal<string> = input.required<string>();
}
