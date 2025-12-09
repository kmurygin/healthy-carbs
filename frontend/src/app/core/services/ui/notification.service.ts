import {Injectable, signal} from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  readonly id: number;
  readonly message: string;
  readonly type: ToastType;
  readonly duration: number;
}

@Injectable({providedIn: 'root'})
export class NotificationService {
  readonly toasts = signal<Toast[]>([]);
  private counter = 0;

  success(message: string, duration = 3000): void {
    this.add(message, 'success', duration);
  }

  error(message: string, duration = 5000): void {
    this.add(message, 'error', duration);
  }

  info(message: string, duration = 3000): void {
    this.add(message, 'info', duration);
  }

  remove(id: number): void {
    this.toasts.update((current) => current.filter((toast) => toast.id !== id));
  }

  private add(message: string, type: ToastType, duration: number): void {
    const id = this.counter++;
    const newToast: Toast = {id, message, type, duration};

    this.toasts.update((current) => [...current, newToast]);

    setTimeout(() => {
      this.remove(id);
    }, duration);
  }
}
