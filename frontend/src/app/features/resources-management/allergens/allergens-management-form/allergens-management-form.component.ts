import {ChangeDetectionStrategy, Component, effect, inject, input, output, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {AllergenService} from '@core/services/allergen/allergen.service';
import {NotificationService} from '@core/services/ui/notification.service';

@Component({
  selector: 'app-allergens-management-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './allergens-management-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllergensManagementFormComponent {
  readonly allergenId = input<number | null>(null);
  readonly closeOutputEmitter = output();
  readonly savedOutputEmitter = output();

  readonly nameControl = new FormControl('', {nonNullable: true, validators: [Validators.required]});
  readonly isSaving = signal(false);
  readonly isEditMode = signal(false);

  private readonly allergenService = inject(AllergenService);
  private readonly notificationService = inject(NotificationService);

  constructor() {
    effect(() => {
      const id = this.allergenId();
      if (id != null) {
        this.loadData(id);
      } else {
        this.isEditMode.set(false);
        this.nameControl.reset();
      }
    });
  }

  onBackdropClick(): void {
    if (!this.isSaving()) {
      this.closeOutputEmitter.emit();
    }
  }

  save(): void {
    if (this.nameControl.invalid) return;

    const allergenName = this.nameControl.value.trim();
    if (!allergenName) return;

    this.isSaving.set(true);
    this.nameControl.disable();

    const id = this.allergenId();
    const request$ = id != null
      ? this.allergenService.update(id, allergenName)
      : this.allergenService.create(allergenName);

    request$.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.nameControl.enable();
        this.savedOutputEmitter.emit();
      },
      error: () => {
        this.notificationService.error(id != null ? 'Failed to update allergen' : 'Failed to create allergen');
        this.isSaving.set(false);
        this.nameControl.enable();
      }
    });
  }

  private loadData(id: number): void {
    this.isEditMode.set(true);
    this.allergenService.getById(id).subscribe({
      next: (allergen) => {
        if (allergen) {
          this.nameControl.setValue(allergen.name);
        }
      },
      error: () => {
        this.notificationService.error('Failed to load allergen');
        this.closeOutputEmitter.emit();
      }
    });
  }
}
