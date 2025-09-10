import {Component, input, InputSignal} from '@angular/core';

@Component({
  selector: 'success-message',
  imports: [],
  templateUrl: './success-message.component.html',
  styleUrl: './success-message.component.css'
})
export class SuccessMessageComponent {
  message: InputSignal<string> = input.required<string>();
}
