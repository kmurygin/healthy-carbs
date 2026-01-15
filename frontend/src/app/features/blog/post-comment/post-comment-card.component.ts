import {DatePipe} from '@angular/common';
import {ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, output} from '@angular/core';
import type {BlogComment} from '@core/models/dto/blog.dto';
import {UserRoleTagComponent} from "@features/blog/user-role-tag/user-role-tag.component";
import {ConfirmationService} from "@core/services/ui/confirmation.service";
import {filter} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {NotificationService} from "@core/services/ui/notification.service";

@Component({
  selector: 'app-post-comment-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, UserRoleTagComponent],
  template: `
    <div class="border-b border-gray-100 px-6 py-6 hover:bg-gray-50 transition-colors">
      <div class="mb-2 flex flex-wrap items-center justify-between gap-4">

        <div class="flex items-center gap-2">
          <span class="font-semibold text-gray-900 truncate">
            {{ comment().author.firstName }} {{ comment().author.lastName }}
          </span>

          @if (isPostAuthor()) {
            <app-user-role-tag selectedRole="AUTHOR"/>
          }

          @if (comment().author.role === 'DIETITIAN') {
            <app-user-role-tag selectedRole="DIETITIAN"/>
          }
        </div>

        <div class="flex items-center gap-3">
          @if (canDelete()) {
            <button
              (click)="onDelete()"
              class="p-1 text-red-400 rounded hover:text-red-600
              transition-colors hover:cursor-pointer"
              title="Delete comment"
              aria-label="Delete comment"
            >
              <i class="fa-solid fa-trash-can text-sm"></i>
            </button>
          }

          <span class="text-xs text-gray-500 whitespace-nowrap">
            {{ comment().createdAt | date:'short' }}
          </span>
        </div>
      </div>

      <p class="text-gray-700 whitespace-pre-line">{{ comment().content }}</p>
    </div>
  `
})
export class PostCommentCardComponent {
  readonly comment = input.required<BlogComment>();
  readonly isPostAuthor = input(false);
  readonly currentUserRole = input<string | null>();
  readonly currentUserId = input<number | null>();

  readonly delete = output();
  readonly canDelete = computed(() => {
    return this.currentUserRole() === 'ADMIN' ||
      this.comment().author.id === this.currentUserId();
  });
  private readonly confirmationService = inject(ConfirmationService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  onDelete() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this comment?',
      title: 'Delete',
      type: 'danger'
    }).pipe(
      filter(Boolean),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.delete.emit();
        this.notificationService.success(`Comment deleted successfully`);
      },
      error: (err: unknown) => {
        console.error(err);
        this.notificationService.error(`Failed to delete the comment.`);
      }
    });
  }
}
