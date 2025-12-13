import {Injectable, signal} from '@angular/core';
import type {Observable} from 'rxjs';
import {Subject} from 'rxjs';

export interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  type: 'danger' | 'info';
}

@Injectable({providedIn: 'root'})
export class ConfirmationService {
  readonly state = signal<{ isOpen: boolean; options: ConfirmationOptions | null }>({
    isOpen: false,
    options: null,
  });

  private pendingSubject: Subject<boolean> | null = null;

  confirm(
    message: string,
    title = 'Confirm Action',
    type: 'danger' | 'info' = 'danger'
  ): Observable<boolean> {
    if (this.pendingSubject) {
      this.pendingSubject.complete();
    }

    this.pendingSubject = new Subject<boolean>();

    this.state.set({
      isOpen: true,
      options: {
        title,
        message,
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        type
      }
    });

    return this.pendingSubject.asObservable();
  }

  resolve(result: boolean): void {
    if (this.pendingSubject && !this.pendingSubject.closed) {
      this.pendingSubject.next(result);
      this.pendingSubject.complete();
      this.pendingSubject = null;
    }
    this.close();
  }

  private close(): void {
    this.state.set({isOpen: false, options: null});
  }
}
