import {ChangeDetectionStrategy, Component} from '@angular/core';


@Component({
  selector: 'app-our-mission',
  imports: [],
  templateUrl: './our-mission.component.html',
  styleUrl: './our-mission.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OurMissionComponent {
  readonly isStatic = true;
}
