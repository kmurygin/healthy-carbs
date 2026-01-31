import {ChangeDetectionStrategy, Component, inject, output, signal} from '@angular/core';
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
  readonly closeOutputEmitter = output();
  readonly savedOutputEmitter = output();

  readonly nameControl = new FormControl('', {nonNullable: true, validators: [Validators.required]});
  readonly isSaving = signal(false);

  private readonly allergenService = inject(AllergenService);
  private readonly notificationService = inject(NotificationService);

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

    this.allergenService.create(allergenName).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.nameControl.enable();
        this.savedOutputEmitter.emit();
      },
      error: () => {
        this.notificationService.error('Failed to create allergen');
        this.isSaving.set(false);
        this.nameControl.enable();
      }
    });
  }
}
