import {Component} from '@angular/core';
import {RouterLink, RouterOutlet} from "@angular/router";
import {MatButtonModule} from '@angular/material/button';

@Component({
    selector: 'app-user',
    imports: [
        RouterLink,
        RouterOutlet,
        MatButtonModule

],
    templateUrl: './user.component.html',
    styleUrl: './user.component.css'
})
export class UserComponent {}
