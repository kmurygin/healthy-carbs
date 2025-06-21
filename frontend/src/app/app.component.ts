import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {FooterComponent} from "./core/layout/footer/footer.component";
import {NavbarComponent} from "./core/layout/navbar/navbar.component";

@Component({
    selector: 'app-root',
  imports: [
    RouterOutlet,
    FooterComponent,
    NavbarComponent,
  ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {}
