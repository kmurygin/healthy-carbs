import {ChangeDetectionStrategy, Component, inject, input, type OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DietitianService} from '@core/services/dietitian/dietitian.service';
import {ErrorMessageComponent} from '@shared/components/error-message/error-message.component';
import {finalize} from 'rxjs';
import {type MealPlanDto} from '@core/models/dto/mealplan.dto';
import {MealPlanTableComponent} from "@features/mealplan/mealplan-table/mealplan-table.component";
import type {UserDto} from "@core/models/dto/user.dto";
import {UserService} from "@core/services/user/user.service";

@Component({
  selector: 'app-client-meal-plans',
  standalone: true,
  imports: [
    CommonModule,
    MealPlanTableComponent,
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
        <app-mealplan-table [mealPlans]="mealPlans()"/>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientMealPlansComponent implements OnInit {
  readonly clientId = input.required<string>();
  readonly dietitianService = inject(DietitianService);
  readonly userService = inject(UserService);

  readonly mealPlans = signal<MealPlanDto[]>([]);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly client = signal<UserDto | null>(null);


  ngOnInit() {
    this.loadPlans();
    this.loadClient();
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
