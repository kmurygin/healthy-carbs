import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';

export interface MacroValues {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}

const MACRO_CONFIG = [
  {key: 'calories' as const, unit: 'kcal', icon: 'fa-fire', color: 'text-orange-500'},
  {key: 'carbs' as const, unit: 'g', icon: 'fa-bread-slice', color: 'text-amber-600'},
  {key: 'protein' as const, unit: 'g', icon: 'fa-drumstick-bite', color: 'text-red-500'},
  {key: 'fat' as const, unit: 'g', icon: 'fa-bottle-droplet', color: 'text-yellow-600'},
] as const;

@Component({
  selector: 'app-macro-summary',
  template: `
    @for (item of items(); track item.key) {
      <span class="inline-flex items-center gap-1.5 font-medium">
        <i aria-hidden="true" class="fa-solid w-3 text-center" [class]="item.icon + ' ' + item.color"></i>
        {{ item.value }} {{ item.unit }}
      </span>
    }
  `,
  host: {class: 'flex flex-row flex-wrap gap-x-3 gap-y-1 text-sm text-gray-600'},
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MacroSummaryComponent {
  readonly macros = input.required<MacroValues>();

  protected readonly items = computed(() => {
    const m = this.macros();
    return MACRO_CONFIG.map(c => ({...c, value: m[c.key]}));
  });
}
