import {ChangeDetectionStrategy, Component, DestroyRef, inject, signal} from '@angular/core';
import {ConfirmationService} from '@core/services/ui/confirmation.service';
import {NotificationService} from '@core/services/ui/notification.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import type {Observable} from 'rxjs';
import {filter, switchMap} from 'rxjs';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export abstract class AbstractManagementComponent<T> {
  readonly isLoading = signal(false);
  readonly isFormOpen = signal(false);
  readonly selectedId = signal<number | null>(null);
  protected readonly currentItem = signal<T | null>(null);
  protected readonly confirmationService = inject(ConfirmationService);
  protected readonly notificationService = inject(NotificationService);
  protected readonly destroyRef = inject(DestroyRef);

  abstract deleteItem(id: number): void;

  abstract reloadData(): void;

  openCreate(): void {
    this.selectedId.set(null);
    this.isFormOpen.set(true);
  }

  openEdit(id: number): void {
    this.selectedId.set(id);
    this.isFormOpen.set(true);
  }

  closeForm(): void {
    this.isFormOpen.set(false);
    this.selectedId.set(null);
  }

  protected setCurrentItem(item: T | null): void {
    this.currentItem.set(item);
  }

  onSaveSuccess(message: string): void {
    this.notificationService.success(message);
    this.closeForm();
    this.reloadData();
  }

  protected confirmAndDelete(id: number, contentName: string, deleteObservable$: Observable<unknown>) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete this ${contentName.toLowerCase()}? This action cannot be undone.`,
      title: `Delete ${contentName}`,
      type: 'danger'
    }).pipe(
      filter(Boolean),
      switchMap(() => deleteObservable$),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.notificationService.success(`${contentName} deleted successfully`);
        this.reloadData();
      },
      error: (err: unknown) => {
        console.error(err);
        this.notificationService.error(`Failed to delete ${contentName.toLowerCase()}.`);
      }
    });
  }
}
