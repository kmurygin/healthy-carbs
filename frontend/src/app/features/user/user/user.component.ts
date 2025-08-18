import {ChangeDetectionStrategy, Component} from '@angular/core';
import {NavigationEnd, Router, RouterLink, RouterOutlet} from "@angular/router";
import {filter} from 'rxjs/operators';
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    RouterLink,
    RouterOutlet,
    NgClass
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserComponent {

  currentSubPath: string = '';

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentSubPath = event.urlAfterRedirects.split('/user/')[1];
      });
  }

  getButtonClasses(path: string) {
    const active = this.currentSubPath === path;
    return {
      'flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition w-42 items-center justify-center': true,
      'border-emerald-600 text-emerald-600 hover:bg-emerald-50': !active,
      'bg-emerald-600 text-white shadow': active,
    };
  }
}
