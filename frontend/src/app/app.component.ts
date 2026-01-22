import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {FooterComponent} from "@core/layout/footer/footer.component";
import {HeaderComponent} from "@core/layout/header/header.component";
import {ConfirmationModalComponent} from "@shared/components/confirmation-modal/confirmation-modal.component";
import {ToastContainerComponent} from "@shared/components/toast-container/toast-container.component";

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    FooterComponent,
    HeaderComponent,
    ConfirmationModalComponent,
    ToastContainerComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  readonly isStatic = true;
}
