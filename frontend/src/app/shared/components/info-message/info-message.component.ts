import type {InputSignal} from '@angular/core';
import {Component, input} from '@angular/core';

@Component({
  selector: 'app-info-message',
  imports: [],
  templateUrl: './info-message.component.html',
  styleUrl: './info-message.component.css'
})
export class InfoMessageComponent {
  message: InputSignal<string> = input.required<string>();
}
