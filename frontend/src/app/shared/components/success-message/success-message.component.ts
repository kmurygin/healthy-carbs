import type {InputSignal} from '@angular/core';
import {Component, input} from '@angular/core';

@Component({
  selector: 'app-success-message',
  imports: [],
  templateUrl: './success-message.component.html',
  styleUrl: './success-message.component.css'
})
export class SuccessMessageComponent {
  message: InputSignal<string> = input.required<string>();
}
