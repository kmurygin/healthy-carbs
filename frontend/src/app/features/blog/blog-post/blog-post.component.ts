import {CommonModule, DatePipe, NgOptimizedImage} from '@angular/common';
import {ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {filter, finalize, map} from 'rxjs';
import {BlogService} from '@core/services/blog/blog.service';
import type {BlogComment, BlogPost} from '@core/models/dto/blog.dto';
import {PostCommentListComponent} from "@features/blog/post-comment-list/post-comment-list.component";
import {AuthService} from "@core/services/auth/auth.service";
import {ConfirmationService} from "@core/services/ui/confirmation.service";
import {NotificationService} from "@core/services/ui/notification.service";
import {BlogFormComponent} from "@features/blog/blog-form/blog-form.component";
import {setErrorNotification} from "@shared/utils";

@Component({
  selector: 'app-blog-post',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DatePipe, RouterLink, PostCommentListComponent, BlogFormComponent, NgOptimizedImage],
  template: `
    <div class="min-h-screen p-6 lg:p-10">
      <div class="max-w-7xl mx-auto">

        <div class="mb-6">
          <div class="mb-2 flex items-center text-sm text-gray-500">
            <a class="hover:text-emerald-600 hover:underline" routerLink="/blog">Blog</a>
            <span class="mx-2">/</span>
            <span>Post</span>
          </div>
        </div>

        @if (error()) {
          <div class="mb-6 rounded-lg bg-red-50 p-4 text-red-700 border border-red-100">
            {{ error() }}
          </div>
        }

        @if (loading()) {
        } @else if (post(); as blogPost) {
          <div class="mb-8 overflow-hidden rounded-xl bg-white shadow-sm">

            @if (blogPost.imageId) {
              <div class="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] bg-gray-100">
                <img
                  [ngSrc]="getPostImageUrl(blogPost.imageId)"
                  alt="Blog post image"
                  fill
                  class="object-cover"
                />
              </div>
            }

            <div class="px-6 py-6 bg-emerald-500">
              <div class="flex justify-between items-start gap-4">

                <div class="flex-1">
                  <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">
                    {{ blogPost.title }}
                  </h1>
                  <p class="mt-2 text-sm text-emerald-900 opacity-90">
                    <span class="font-semibold">
                      {{ blogPost.author.firstName }} {{ blogPost.author.lastName }}
                    </span>
                    • {{ blogPost.createdAt | date:'medium' }}
                  </p>
                </div>

                @if (canModify()) {
                  <div class="flex items-center gap-2 shrink-0">
                    <button
                      (click)="showEditForm.set(true)"
                      class="p-2 rounded-lg bg-white/20 text-gray-900 hover:bg-white/40
                      transition-colors hover:cursor-pointer"
                      title="Edit Post"
                    >
                      <i class="fa-solid fa-pen-to-square"></i>
                    </button>

                    <button
                      (click)="confirmAndDeletePost()"
                      [disabled]="isDeleting()"
                      class="p-2 rounded-lg bg-white/20 text-gray-900 hover:bg-red-500
                      hover:text-white transition-all disabled:opacity-50 hover:cursor-pointer"
                      title="Delete Post"
                    >
                      @if (isDeleting()) {
                        <i class="fa-solid fa-circle-notch fa-spin"></i>
                      } @else {
                        <i class="fa-solid fa-trash-can"></i>
                      }
                    </button>
                  </div>
                }
              </div>
            </div>

            <div class="px-6 py-6">
              <div class="whitespace-pre-line text-gray-800 leading-7">
                {{ blogPost.content }}
              </div>
            </div>

            <app-post-comment-list
              [postId]="blogPost.id"
              [postAuthorId]="blogPost.author.id"
              [comments]="blogPost.comments ?? []"
              (commentCreated)="onCommentCreated($event)"
              (commentDeleted)="onCommentDeleted($event)"
            />
          </div>
        } @else {
          <div class="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
            <h3 class="mt-2 text-sm font-semibold text-gray-900">Post not found</h3>
            <p class="mt-1 text-sm text-gray-500">This post may have been removed.</p>
          </div>
        }
      </div>

      @if (showEditForm()) {
        <app-blog-form
          [postId]="post()?.id || null"
          (cancelled)="showEditForm.set(false)"
          (success)="onEditSuccess()"
        />
      }
    </div>
  `,
})
export class BlogPostComponent {
  readonly post = signal<BlogPost | null>(null);
  readonly loading = signal(false);
  readonly isDeleting = signal(false);
  readonly error = signal<string | null>(null);
  readonly showEditForm = signal(false);

  private readonly blogService = inject(BlogService);
  private readonly authService = inject(AuthService);
  readonly canModify = computed(() => {
    const currentPost = this.post();
    if (!currentPost) return false;

    const userId = this.authService.userId();
    const role = this.authService.userRole();

    return currentPost.author.id === userId || role === 'ADMIN';
  });
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly notificationService = inject(NotificationService);

  constructor() {
    this.route.paramMap
      .pipe(
        map((params) => Number(params.get('id'))),
        takeUntilDestroyed()
      )
      .subscribe((id) => {
        if (Number.isFinite(id) && id > 0) {
          this.loadPost(id);
        } else {
          this.post.set(null);
        }
      });
  }

  loadPost(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.blogService.getPostById(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.loading.set(false)
        })
      )
      .subscribe({
        next: (post) => {
          this.post.set(post);
        },
        error: (err: unknown) => {
          setErrorNotification(this.notificationService, err, "Failed to load post.");
        }
      });
  }

  getPostImageUrl(imageId: number): string {
    return this.blogService.getPostImageUrl(imageId);
  }

  onEditSuccess(): void {
    this.showEditForm.set(false);
    const currentId = this.post()?.id;
    if (currentId) {
      this.loadPost(currentId);
      this.notificationService.success('Post updated successfully');
    }
  }

  confirmAndDeletePost(): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this post? This action cannot be undone.',
      title: 'Delete',
      type: 'danger'
    }).pipe(
      filter(Boolean),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.deletePost()
      },
      error: () => {
        this.notificationService.error(`Failed to delete the post.`)
      }
    });
  }

  onCommentCreated(newComment: BlogComment): void {
    this.post.update((currentPost: BlogPost | null) => {
      if (!currentPost) return null;
      return {
        ...currentPost,
        comments: [newComment, ...(currentPost.comments ?? [])]
      };
    });
  }

  onCommentDeleted(commentId: number): void {
    this.post.update((post: BlogPost | null) => {
      if (!post) return null;
      return {
        ...post,
        comments: post.comments?.filter((comment: BlogComment) => comment.id !== commentId) ?? []
      };
    });
  }

  private deletePost(): void {
    const id = this.post()?.id;
    if (!id) return;

    this.isDeleting.set(true);
    this.blogService.deletePost(id)
      .pipe(finalize(() => {
        this.isDeleting.set(false)
      }))
      .subscribe({
        next: () => {
          this.notificationService.success(`Post deleted successfully`);
          void this.router.navigate(['/blog']);
        },
        error: (err: unknown) => {
          setErrorNotification(this.notificationService, err, "Failed to delete post");
        }
      });
  }
}
