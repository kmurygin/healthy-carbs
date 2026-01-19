import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import type {IconDefinition} from '@fortawesome/free-solid-svg-icons';
import {faCheckCircle, faExclamationCircle, faInfoCircle, faTimes} from '@fortawesome/free-solid-svg-icons';
import type {ToastType} from '@core/services/ui/notification.service';
import {NotificationService} from '@core/services/ui/notification.service';

interface ToastConfig {
  icon: IconDefinition;
  borderClass: string;
  textClass: string;
  bgClass: string;
}

@Component({
  selector: 'app-toast-container',
  imports: [CommonModule, FontAwesomeModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    @keyframes progress {
      from {
        width: 100%;
      }
      to {
        width: 0;
      }
    }

    .animate-progress {
      animation-name: progress;
      animation-timing-function: linear;
      animation-fill-mode: forwards;
    }
  `],
  template: `
    <div class="fixed top-4 right-4 z-100 flex flex-col gap-3 w-full max-w-sm pointer-events-none p-4">

      @for (toast of notificationService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto relative flex flex-col w-full rounded-xl bg-white
          shadow-lg ring-1 ring-black/5 transition-all overflow-hidden"
          [class]="getToastConfig(toast.type).borderClass"
        >
          <div class="p-4 flex items-center">
            <div class="shrink-0">
              <fa-icon
                [icon]="getToastConfig(toast.type).icon"
                [class]="getToastConfig(toast.type).textClass"
                class="text-xl"
              ></fa-icon>
            </div>

            <div class="ml-3 w-0 flex-1">
              <p class="text-sm font-medium text-gray-900">{{ toast.message }}</p>
            </div>

            <div class="ml-4 flex shrink-0">
              <button
                (click)="notificationService.remove(toast.id)"
                class="p-1.5 -mr-1 text-gray-400 hover:text-gray-500 rounded-lg
                hover:bg-gray-50 transition-colors cursor-pointer"
                aria-label="Close notification"
                type="button"
              >
                <fa-icon [icon]="icons.close" class="text-sm"></fa-icon>
              </button>
            </div>
          </div>

          <div class="h-1 w-full bg-gray-100">
            <div
              class="h-full animate-progress"
              [style.animation-duration]="toast.duration + 'ms'"
              [ngClass]="getToastConfig(toast.type).bgClass"
            ></div>
          </div>
        </div>
      }
    </div>
  `
})
export class ToastContainerComponent {
  readonly notificationService = inject(NotificationService);

  readonly icons = {close: faTimes};

  private readonly config: Record<ToastType, ToastConfig> = {
    success: {
      icon: faCheckCircle,
      borderClass: 'border-l-4 border-emerald-500',
      textClass: 'text-emerald-500',
      bgClass: 'bg-emerald-500'
    },
    error: {
      icon: faExclamationCircle,
      borderClass: 'border-l-4 border-red-500',
      textClass: 'text-red-500',
      bgClass: 'bg-red-500'
    },
    info: {
      icon: faInfoCircle,
      borderClass: 'border-l-4 border-blue-500',
      textClass: 'text-blue-500',
      bgClass: 'bg-blue-500'
    }
  };

  getToastConfig(type: ToastType): ToastConfig {
    return this.config[type];
  }
}
