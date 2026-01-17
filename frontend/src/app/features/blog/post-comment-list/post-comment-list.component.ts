import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, DestroyRef, inject, input, output, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {finalize} from 'rxjs';
import {BlogService} from '@core/services/blog/blog.service';
import type {BlogComment} from '@core/models/dto/blog.dto';
import {PostCommentCardComponent} from "@features/blog/post-comment/post-comment-card.component";
import {AuthService} from "@core/services/auth/auth.service";
import {setErrorNotification} from "@shared/utils";
import {NotificationService} from "@core/services/ui/notification.service";

@Component({
  selector: 'app-post-comment-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, PostCommentCardComponent, FormsModule],
  template: `
    <div class="bg-white h-full">
      <div
        class="px-6 py-4 bg-gray-50 flex items-center justify-between border-t border-gray-100"
      >
        <h3 class="text-lg font-semibold text-gray-900">
          Comments ({{ comments().length }})
        </h3>
      </div>

      <div class="py-4">
        <div class="px-6">
          <form class="mb-1" (ngSubmit)="submitComment()">
            <textarea
              [formControl]="commentControl"
              class="w-full rounded-xl border border-gray-200 bg-white p-3
              focus:border-transparent focus:ring-2 focus:ring-emerald-600"
              rows="3"
              placeholder="Write a comment…"
            ></textarea>

            <div class="mt-3 flex items-center justify-between gap-3">
              <div class="text-sm text-gray-500">
                @if (commentControl.touched && commentControl.invalid) {
                  <span class="text-red-600">Comment cannot be empty.</span>
                }
                @if (error()) {
                  <span class="text-red-600 ml-2">{{ error() }}</span>
                }
              </div>

              <button
                type="submit"
                [disabled]="commentControl.invalid || isSubmitting()"
                class="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white
                shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-50"
              >
                {{ isSubmitting() ? 'Posting…' : 'Post comment' }}
              </button>
            </div>
          </form>
        </div>

        @for (comment of comments(); track comment.id) {
          <div class="border-t border-gray-100">
            <app-post-comment-card
              [comment]="comment"
              [isPostAuthor]="comment.author.id === postAuthorId()"
              [currentUserRole]="role"
              [currentUserId]="userId"
              (delete)="handleDeleteComment(comment.id)"
            />
          </div>
        }
      </div>
    </div>
  `
})
export class PostCommentListComponent {
  readonly postId = input.required<number>();
  readonly postAuthorId = input.required<number>();
  readonly comments = input<BlogComment[]>([]);
  readonly commentCreated = output<BlogComment>();
  readonly commentDeleted = output<number>();
  readonly isSubmitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly commentControl = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required],
  });
  private readonly blogService = inject(BlogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  readonly role = this.authService.userRole();
  readonly userId = this.authService.userId();
  private readonly notificationService = inject(NotificationService);

  submitComment(): void {
    if (this.commentControl.invalid || this.isSubmitting()) return;

    const content = this.commentControl.value.trim();
    if (!content) {
      this.commentControl.markAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);

    this.blogService
      .addComment(this.postId(), {content})
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isSubmitting.set(false)
        })
      )
      .subscribe({
        next: (createdComment) => {
          if (!createdComment) return;

          this.commentControl.reset();
          this.commentCreated.emit(createdComment);
        },
        error: (err: unknown) => {
          setErrorNotification(this.notificationService, err, "Failed to add comment.");
        },
      });
  }

  handleDeleteComment(commentId: number): void {
    this.blogService.deleteComment(commentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.commentDeleted.emit(commentId);
        },
        error: (err: unknown) => {
          setErrorNotification(this.notificationService, err, "Unknown error");
        }
      });
  }
}
