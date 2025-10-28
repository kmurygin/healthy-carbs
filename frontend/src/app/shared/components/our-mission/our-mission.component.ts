import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-our-mission',
  imports: [
    CommonModule,
  ],
  templateUrl: './our-mission.component.html',
  styleUrl: './our-mission.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OurMissionComponent {
}
