import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';

@Component({
  selector: 'app-favourite-recipes-toggle',
  imports: [],
  templateUrl: './favourite-recipes-toggle.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavouriteRecipesToggleComponent {
  readonly onlyFavourites = input.required<boolean>();
  readonly onlyFavouritesChange = output<boolean>();
  readonly id = 'fav-toggle-' + crypto.randomUUID();

  onToggle(checked: boolean): void {
    this.onlyFavouritesChange.emit(checked);
  }
}
