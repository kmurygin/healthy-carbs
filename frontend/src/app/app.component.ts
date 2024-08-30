import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserComponent } from "./user/user.component";
import {NgFor} from "@angular/common";

@Component({
  selector: 'app-root',
  standalone: true,
  imports:
    [
      RouterOutlet,
      UserComponent,
      NgFor
    ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'healthy-carbs';
}
