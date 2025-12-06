import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {CommonModule, DecimalPipe, TitleCasePipe} from '@angular/common';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faFire, faPen, faTrash} from '@fortawesome/free-solid-svg-icons';
import type {RecipeDto} from '@core/models/dto/recipe.dto';

@Component({
  selector: 'app-dietitian-recipe-mobile-list',
  imports: [CommonModule, FontAwesomeModule, TitleCasePipe, DecimalPipe],
  templateUrl: './dietitian-recipe-mobile-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DietitianRecipeMobileListComponent {
  readonly recipes = input.required<readonly RecipeDto[]>();
  readonly currentUserId = input<number | null>(null);

  readonly edit = output<number>();
  readonly delete = output<number>();

  protected readonly icons = {
    fire: faFire,
    pen: faPen,
    trash: faTrash
  };

  isOwner(recipe: RecipeDto): boolean {
    return recipe.author?.id === this.currentUserId();
  }
}
