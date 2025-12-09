import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {CommonModule, DecimalPipe, TitleCasePipe} from '@angular/common';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faFire, faGlobe, faPen, faTrash, faUserTag} from '@fortawesome/free-solid-svg-icons';
import type {RecipeDto} from '@core/models/dto/recipe.dto';

@Component({
  selector: 'app-recipes-management-table',
  imports: [CommonModule, FontAwesomeModule, TitleCasePipe, DecimalPipe],
  templateUrl: './recipes-management-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecipesManagementTableComponent {
  readonly recipes = input.required<readonly RecipeDto[]>();
  readonly currentUserId = input<number | null>(null);

  readonly edit = output<number>();
  readonly delete = output<number>();

  protected readonly icons = {
    pen: faPen,
    trash: faTrash,
    userTag: faUserTag,
    globe: faGlobe,
    fire: faFire
  };

  isOwner(recipe: RecipeDto): boolean {
    return recipe.author?.id === this.currentUserId();
  }
}
