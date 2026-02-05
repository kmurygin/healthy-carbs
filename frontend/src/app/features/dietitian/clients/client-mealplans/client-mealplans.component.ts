import {ChangeDetectionStrategy, Component, DestroyRef, inject, input, type OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {filter, finalize, switchMap} from 'rxjs';
import {DietitianService} from '@core/services/dietitian/dietitian.service';
import {MealPlanService} from '@core/services/mealplan/mealplan.service';
import {ConfirmationService} from '@core/services/ui/confirmation.service';
import {NotificationService} from '@core/services/ui/notification.service';
import {ErrorMessageComponent} from '@shared/components/error-message/error-message.component';
import {type MealPlanDto} from '@core/models/dto/mealplan.dto';
import type {UserDto} from "@core/models/dto/user.dto";
import {UserService} from "@core/services/user/user.service";
import {setErrorNotification} from '@shared/utils';

@Component({
  selector: 'app-client-meal-plans',
  standalone: true,
  imports: [
    CommonModule,
    ErrorMessageComponent
  ],
  template: `
    <div class="container mx-auto px-4 py-8 max-w-7xl">
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900">Meal Plans History</h2>
        <p class="mt-2 text-gray-600">{{ client()?.firstName | titlecase }} {{ client()?.lastName | titlecase }} </p>
      </div>

      @if (isLoading()) {
        <!--        <app-loading-message message="Loading meal plans..."/>-->
      } @else if (error()) {
        <app-error-message [message]="error()!"/>
      } @else if (mealPlans().length === 0) {
        <div class="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <p class="text-gray-500">No meal plans found for this client.</p>
        </div>
      } @else {
        <div class="space-y-4">
          @for (plan of mealPlans(); track plan.id) {
            <div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div class="flex items-center justify-between mb-2">
                <div class="font-semibold text-gray-900">
                  Plan #{{ plan.id }} — {{ plan.createdAt | date: 'mediumDate' }}
                </div>
                <span class="text-xs font-medium text-gray-500 uppercase">{{ plan.source }}</span>
              </div>

              <div class="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
                <span><i class="fa-solid fa-fire text-orange-500"></i> {{ plan.totalCalories | number: '1.0-0' }}
                  kcal</span>
                <span><i class="fa-solid fa-bread-slice text-amber-600"></i> {{ plan.totalCarbs | number: '1.0-0' }} g carbs</span>
                <span><i class="fa-solid fa-drumstick-bite text-red-500"></i> {{ plan.totalProtein | number: '1.0-0' }}
                  g protein</span>
                <span><i class="fa-solid fa-bottle-droplet text-yellow-600"></i> {{ plan.totalFat | number: '1.0-0' }} g fat</span>
              </div>

              <div class="flex gap-2">
                <button
                  (click)="onEditPlan(plan)"
                  class="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white
                    px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50
                    transition-colors hover:cursor-pointer"
                  type="button"
                >
                  <i class="fa-solid fa-pen-to-square"></i> Edit
                </button>
                <button
                  (click)="onDeletePlan(plan)"
                  [disabled]="deletingPlanId() === plan.id"
                  class="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white
                    px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50
                    disabled:opacity-50 transition-colors hover:cursor-pointer"
                  type="button"
                >
                  <i class="fa-solid fa-trash"></i> Delete
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientMealPlansComponent implements OnInit {
  readonly clientId = input.required<string>();
  readonly mealPlans = signal<MealPlanDto[]>([]);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly client = signal<UserDto | null>(null);
  readonly deletingPlanId = signal<number | null>(null);
  private readonly dietitianService = inject(DietitianService);
  private readonly userService = inject(UserService);
  private readonly mealPlanService = inject(MealPlanService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.loadPlans();
    this.loadClient();
  }

  onEditPlan(plan: MealPlanDto): void {
    void this.router.navigate(
      ['/dietitian/clients', this.clientId(), 'create-meal-plan'],
      {queryParams: {editPlanId: plan.id}}
    );
  }

  onDeletePlan(plan: MealPlanDto): void {
    this.confirmationService.confirm({
      title: 'Delete Meal Plan',
      message: `Are you sure you want to delete meal plan #${plan.id}? This action cannot be undone.`,
      type: 'danger'
    }).pipe(
      filter(confirmed => confirmed),
      switchMap(() => {
        this.deletingPlanId.set(plan.id);
        return this.mealPlanService.delete(plan.id);
      }),
      finalize(() => {
        this.deletingPlanId.set(null);
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: () => {
        this.mealPlans.update(plans => plans.filter(p => p.id !== plan.id));
        this.notificationService.success('Meal plan deleted successfully.');
      },
      error: (error: unknown) => {
        setErrorNotification(this.notificationService, error, 'Failed to delete meal plan.');
      }
    });
  }

  private loadPlans() {
    this.isLoading.set(true);
    this.dietitianService.getClientMealPlans(Number(this.clientId()))
      .pipe(finalize(() => {
        this.isLoading.set(false)
      }))
      .subscribe({
        next: (plans) => {
          this.mealPlans.set(plans)
        },
        error: () => {
          this.error.set('Failed to load client meal plans.')
        }
      });
  }

  private loadClient() {
    this.userService.getUserById(Number(this.clientId()))
      .pipe()
      .subscribe({
        next: (client) => {
          this.client.set(client)
        },
        error: () => {
          this.error.set('Failed to load client.')
        }
      });
  }
}
