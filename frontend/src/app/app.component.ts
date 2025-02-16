import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {NgIf} from "@angular/common";

@Component({
    selector: 'app-root',
    imports: [
        RouterOutlet,
        NgIf
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {}
