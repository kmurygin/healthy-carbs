import {ChangeDetectionStrategy, Component} from '@angular/core';

import {RouterModule} from '@angular/router';
import {OurMissionComponent} from '@shared/components/our-mission/our-mission.component';
import {KeyFeaturesComponent} from '@shared/components/key-features/key-features.component';
import {HowWorksComponent} from '@shared/components/how-works/how-works.component';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [
    RouterModule,
    OurMissionComponent,
    KeyFeaturesComponent,
    HowWorksComponent
  ],
  templateUrl: './index.component.html',
  styleUrl: './index.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IndexComponent {
}
