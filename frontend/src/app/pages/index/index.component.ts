import {ChangeDetectionStrategy, Component} from '@angular/core';

import {RouterModule} from '@angular/router';
import {KeyFeaturesComponent} from '@shared/components/key-features/key-features.component';
import {HowWorksComponent} from '@shared/components/how-works/how-works.component';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [
    RouterModule,
    KeyFeaturesComponent,
    HowWorksComponent
  ],
  templateUrl: './index.component.html',
  styleUrl: './index.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IndexComponent {
  readonly isStatic = true;
}
