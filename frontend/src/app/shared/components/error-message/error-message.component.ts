import type {InputSignal} from '@angular/core';
import {Component, input} from '@angular/core';

@Component({
  selector: 'app-error-message',
  imports: [],
  templateUrl: './error-message.component.html',
  styleUrl: './error-message.component.css'
})
export class ErrorMessageComponent {
  message: InputSignal<string> = input.required<string>();
}
