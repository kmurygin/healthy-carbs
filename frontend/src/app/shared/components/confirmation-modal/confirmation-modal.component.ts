import type {ElementRef} from '@angular/core';
import {ChangeDetectionStrategy, Component, effect, inject, viewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faCheck, faExclamationTriangle, faInfoCircle, faTimes} from '@fortawesome/free-solid-svg-icons';
import {ConfirmationService} from '@core/services/ui/confirmation.service';

@Component({
  selector: 'app-confirmation-modal',
  imports: [CommonModule, FontAwesomeModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'onEscape()'
  },
  template: `
    @if (confirmationService.state().isOpen && confirmationService.state().options; as opts) {
      <div
        #modalContainer
        class="fixed inset-0 z-100 bg-slate-900/60 backdrop-blur-sm transition-all duration-300 outline-none"
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        (click)="onBackdropInteraction($event)"
        (keyup.enter)="onBackdropInteraction($event)"
        (keyup.space)="onBackdropInteraction($event)"
      >
        <div class="flex min-h-full items-center justify-center p-4">
          <div
            class="relative w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6
            shadow-2xl ring-1 ring-gray-200 transition-all animate-in fade-in zoom-in-95 duration-200"
          >
            <div class="flex flex-col items-center text-center">
              <div
                [class]="opts.type === 'danger' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'"
                class="flex h-16 w-16 items-center justify-center rounded-full mb-5 transition-colors"
              >
                <fa-icon
                  [icon]="opts.type === 'danger' ? icons.danger : icons.info"
                  class="text-2xl"
                ></fa-icon>
              </div>
              <h3 class="text-xl font-bold text-gray-900 tracking-tight">{{ opts.title }}</h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500 leading-relaxed">{{ opts.message }}</p>
              </div>
            </div>

            <div class="mt-8 grid grid-cols-2 gap-3">
              <button
                type="button" (click)="confirmationService.resolve(false)"
                class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5
                text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300
                hover:bg-gray-50 hover:text-gray-900 transition-all cursor-pointer"
              >
                <fa-icon [icon]="icons.times" class="text-gray-400"></fa-icon>
                {{ opts.cancelText }}
              </button>
              <button
                type="button"
                (click)="confirmationService.resolve(true)"
                [class]="getConfirmButtonClass(opts.type)"
              >
                <fa-icon [icon]="icons.check"></fa-icon>
                {{ opts.confirmText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmationModalComponent {
  public confirmationService = inject(ConfirmationService);
  protected readonly icons = {
    danger: faExclamationTriangle,
    info: faInfoCircle,
    check: faCheck,
    times: faTimes
  };
  private readonly modalContainer = viewChild<ElementRef<HTMLDivElement>>('modalContainer');

  constructor() {
    effect(() => {
      if (this.confirmationService.state().isOpen) {
        setTimeout(() => {
          this.modalContainer()?.nativeElement.focus();
        }, 0);
      }
    });
  }

  onEscape(): void {
    if (this.confirmationService.state().isOpen) {
      this.confirmationService.resolve(false);
    }
  }

  onBackdropInteraction(event: Event): void {
    if (event.target === event.currentTarget) {
      this.confirmationService.resolve(false);
    }
  }

  getConfirmButtonClass(type: 'danger' | 'info'): string {
    const base = 'inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 ' +
      'text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 ' +
      'focus-visible:outline-offset-2 transition-all cursor-pointer';

    const variant = type === 'danger'
      ? 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-600'
      : 'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-600';

    return `${base} ${variant}`;
  }
}
