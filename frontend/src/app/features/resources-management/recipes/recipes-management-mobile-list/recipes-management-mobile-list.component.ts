import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {CommonModule, DecimalPipe, TitleCasePipe} from '@angular/common';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faFire, faPen, faTrash} from '@fortawesome/free-solid-svg-icons';
import type {RecipeDto} from '@core/models/dto/recipe.dto';

@Component({
  selector: 'app-recipes-management-mobile-list',
  imports: [CommonModule, FontAwesomeModule, TitleCasePipe, DecimalPipe],
  templateUrl: './recipes-management-mobile-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecipesManagementMobileListComponent {
  readonly recipes = input.required<readonly RecipeDto[]>();
  readonly currentUserId = input<number | null>(null);
  readonly isAdmin = input<boolean>(false);

  readonly edit = output<number>();
  readonly delete = output<number>();

  protected readonly icons = {
    fire: faFire,
    pen: faPen,
    trash: faTrash
  };

  canModify(recipe: RecipeDto): boolean {
    return this.isAdmin() || recipe.author?.id === this.currentUserId();
  }
}
