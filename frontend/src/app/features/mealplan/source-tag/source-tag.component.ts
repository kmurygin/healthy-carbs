import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {CommonModule} from '@angular/common';
import type {MealPlanSource} from "@core/models/enum/mealplan-source.enum";

type SourceStyles = Readonly<{
  style: string;
  icon: string;
  label?: string;
  ariaLabel?: string;
}>;

@Component({
  selector: 'app-source-tag',
  imports: [CommonModule],
  template: `
    @if (styles(); as styles) {
      <span
        [attr.aria-label]="styles.ariaLabel"
        [title]="styles.ariaLabel"
        class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium
               border border-transparent"
        [class]="styles.style"
      >
        <i class="fa-solid" [class]="styles.icon" aria-hidden="true"></i>
        {{ source() | titlecase }}
      </span>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SourceTagComponent {
  readonly source = input.required<MealPlanSource>();

  sourceStyles: Record<MealPlanSource, SourceStyles> = {
    PURCHASED: {
      style: 'bg-blue-100 text-blue-800',
      icon: 'fa-receipt',
      label: 'Purchased',
      ariaLabel: 'Purchased plan'
    },
    GENERATED: {
      style: 'bg-amber-100 text-amber-800',
      icon: 'fa-robot',
      label: 'Generated',
      ariaLabel: 'Generated plan'
    },
    DIETITIAN: {
      style: 'bg-emerald-100 text-emerald-800',
      icon: 'fa-user',
      label: 'Dietitian',
      ariaLabel: 'Generated plan'
    }
  };

  readonly styles = computed<SourceStyles>(() => {
    const mealPlanSource: MealPlanSource = this.source();
    return this.sourceStyles[mealPlanSource];
  });
}
