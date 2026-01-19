import {Component, input} from '@angular/core';
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-auth-helper-text',
  imports: [
    RouterLink
  ],
  template: `
    <div class="mt-8 pt-6 border-t border-gray-200 text-center">
      <p class="text-sm text-gray-600">
        {{ infoText() }}
        <a
          class="ml-1 font-bold text-emerald-700 hover:text-emerald-600 transition-colors"
          [routerLink]=linkUrl()
        >
          {{ linkText() }}
        </a>
      </p>
    </div>
  `,
})
export class AuthHelperTextComponent {
  readonly infoText = input<string>('');
  readonly linkText = input<string>('');
  readonly linkUrl = input<string>('');
}
