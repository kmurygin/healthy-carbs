import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {RouterLink} from "@angular/router";
import {AuthService} from '@core/services/auth/auth.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
  private readonly authService = inject(AuthService);
  readonly isLoggedIn = computed(() => this.authService.isLoggedIn());
}
