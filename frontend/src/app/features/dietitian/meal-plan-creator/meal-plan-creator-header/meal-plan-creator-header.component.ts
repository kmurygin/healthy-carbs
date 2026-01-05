import {ChangeDetectionStrategy, Component, input, output,} from '@angular/core';
import {ProfileChip} from "@features/dietitian/meal-plan-creator/meal-plan-creator.util";

@Component({
  selector: 'app-meal-plan-creator-header',
  templateUrl: './meal-plan-creator-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MealPlanCreatorHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly profileChips = input<ProfileChip[]>([]);
  readonly canSave = input<boolean>(false);
  readonly showLibraryButton = input<boolean>(false);

  readonly toggleLibrary = output<void>();
  readonly save = output<void>();
}
