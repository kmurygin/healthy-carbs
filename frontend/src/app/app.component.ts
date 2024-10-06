import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserComponent } from "./user/user.component";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatIcon} from "@angular/material/icon";
import {MatAnchor, MatButton, MatIconButton} from "@angular/material/button";
import {MatDividerModule} from "@angular/material/divider";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-root',
  standalone: true,
  imports:
    [
      RouterOutlet,
      UserComponent,
      MatSlideToggleModule,
      MatToolbarModule,
      MatIcon,
      MatIconButton,
      MatDividerModule,
      MatButton,
      MatAnchor,
      NgIf
    ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'healthy-carbs';
  ifLoggedIn = false;
  // username: 'kmurygin';
}
