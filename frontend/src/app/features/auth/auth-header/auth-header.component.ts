import {ChangeDetectionStrategy, Component, input} from '@angular/core';

@Component({
  selector: 'app-auth-header',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="text-center">
      <h2 class="text-3xl font-extrabold text-emerald-900">
        {{ headerText() }}
      </h2>
      @if (headerSubText()) {
        <p class="mt-2 text-sm text-gray-600">
          {{ headerSubText() }}
        </p>
      }
    </div>
  `,
})
export class AuthHeaderComponent {
  readonly headerText = input<string>('');
  readonly headerSubText = input<string | null>(null);
}
