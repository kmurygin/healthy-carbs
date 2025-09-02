import {Component, input, InputSignal} from '@angular/core';

@Component({
  selector: 'error-message',
  imports: [],
  templateUrl: './error-message.component.html',
  styleUrl: './error-message.component.css'
})
export class ErrorMessageComponent {
  message: InputSignal<string> = input.required<string>();
}
