import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faFire,
  faPen,
  faTrash,
  faGlobe,
  faUserTag
} from '@fortawesome/free-solid-svg-icons';
import { IngredientDto } from '@core/models/dto/ingredient.dto';
import { IngredientCategory } from '@core/models/enum/ingredient-category.enum';
import { CategoryIconMap } from '@core/constants/category-icon.map';
import {formatEnum} from "@shared/utils";

@Component({
  selector: 'app-ingredients-management-mobile-list',
  imports: [CommonModule, FontAwesomeModule, DecimalPipe],
  templateUrl: './ingredients-management-mobile-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IngredientsManagementMobileListComponent {
  readonly ingredients = input.required<readonly IngredientDto[]>();
  readonly currentUserId = input<number | null>(null);

  readonly edit = output<number>();
  readonly delete = output<number>();

  protected readonly icons = {
    fire: faFire,
    pen: faPen,
    trash: faTrash,
    globe: faGlobe,
    userTag: faUserTag
  };

  isOwner(ingredient: IngredientDto): boolean {
    return ingredient.author?.id === this.currentUserId();
  }

  iconFor(category: IngredientCategory): string {
    const key = category.toUpperCase().trim();
    return CategoryIconMap[key as keyof typeof CategoryIconMap] || CategoryIconMap['OTHER'];
  }

  protected readonly formatEnum = formatEnum;
}
