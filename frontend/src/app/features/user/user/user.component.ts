import {Component, ChangeDetectionStrategy} from '@angular/core';
import {Router, RouterLink, RouterOutlet, NavigationEnd} from "@angular/router";
import {MatButtonModule} from '@angular/material/button';
import {MatCard} from "@angular/material/card";
import {MatIconModule} from "@angular/material/icon";
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-user',
  imports: [
    RouterLink,
    RouterOutlet,
    MatButtonModule,
    MatCard,
    MatIconModule
  ],
    templateUrl: './user.component.html',
    styleUrl: './user.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserComponent {

  currentSubPath: string = '';

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const path = event.urlAfterRedirects.split('/user/')[1];
        this.currentSubPath = path;
      });
  }
}
