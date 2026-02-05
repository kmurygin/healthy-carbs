import {ChangeDetectionStrategy, Component, inject, output, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs';
import {MealPlanTemplateService} from '@core/services/meal-plan-template/meal-plan-template.service';
import type {MealPlanTemplateDto} from '@core/models/dto/meal-plan-template.dto';

@Component({
  selector: 'app-share-template-dialog',
  imports: [CommonModule],
  template: `
    <div
      (click)="closed.emit()"
      (keydown.escape)="closed.emit()"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      tabindex="0"
    >
      <div
        (click)="$event.stopPropagation()"
        (keyup.enter)="$event.stopPropagation()"
        class="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 overflow-hidden max-h-[80vh] flex flex-col"
        tabindex="-1"
      >
        <div class="bg-gray-50 px-6 py-4 border-b border-gray-100">
          <h3 class="font-semibold text-gray-900">Share Template with Client</h3>
          <p class="text-sm text-gray-500 mt-1">Select a meal plan template to share</p>
        </div>

        <div class="flex-1 overflow-y-auto p-4">
          @if (isLoading()) {
            <div class="flex items-center justify-center p-8 text-gray-500">
              <i class="fa-solid fa-spinner fa-spin mr-2"></i>
              Loading templates...
            </div>
          } @else if (templates().length === 0) {
            <div class="text-center p-8 text-gray-500">
              No templates available.
            </div>
          } @else {
            <div class="space-y-2">
              @for (template of templates(); track template.id) {
                <button
                  (click)="selectTemplate(template)"
                  [class.ring-2]="selectedTemplate()?.id === template.id"
                  [class.ring-emerald-500]="selectedTemplate()?.id === template.id"
                  [class.bg-emerald-50]="selectedTemplate()?.id === template.id"
                  class="w-full text-left rounded-xl border border-gray-200 p-4
                  hover:bg-gray-50 transition-colors cursor-pointer"
                  type="button"
                >
                  <div class="font-medium text-gray-900">{{ template.name }}</div>
                  @if (template.description) {
                    <div class="text-sm text-gray-500 mt-1">{{ template.description }}</div>
                  }
                  @if (template.totalCalories) {
                    <div class="text-xs text-gray-400 mt-2">
                      {{ template.totalCalories | number:'1.0-0' }} kcal
                      @if (template.totalCarbs) {
                        · {{ template.totalCarbs | number:'1.0-0' }}g carbs
                      }
                      @if (template.totalProtein) {
                        · {{ template.totalProtein | number:'1.0-0' }}g protein
                      }
                      @if (template.totalFat) {
                        · {{ template.totalFat | number:'1.0-0' }}g fat
                      }
                    </div>
                  }
                </button>
              }
            </div>
          }
        </div>

        <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
          <button
            (click)="closed.emit()"
            [disabled]="isSharing()"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300
            rounded-lg hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            (click)="confirmShare()"
            [disabled]="!selectedTemplate() || isSharing()"
            class="px-4 py-2 text-sm font-medium text-white bg-emerald-600
            rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center gap-2 cursor-pointer"
          >
            @if (isSharing()) {
              <div class="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            }
            Share
          </button>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShareTemplateDialogComponent {
  readonly closed = output();
  readonly share = output<number>();

  readonly selectedTemplate = signal<MealPlanTemplateDto | null>(null);
  readonly isSharing = signal(false);

  private readonly templateService = inject(MealPlanTemplateService);

  private readonly state = toSignal(
    this.templateService.getAll().pipe(
      map(templates => ({templates, loading: false}))
    ),
    {initialValue: {templates: [] as MealPlanTemplateDto[], loading: true}}
  );

  readonly templates = () => this.state().templates;
  readonly isLoading = () => this.state().loading;

  selectTemplate(template: MealPlanTemplateDto): void {
    this.selectedTemplate.set(
      this.selectedTemplate()?.id === template.id ? null : template
    );
  }

  confirmShare(): void {
    const template = this.selectedTemplate();
    if (!template) return;
    this.isSharing.set(true);
    this.share.emit(template.id);
  }
}
