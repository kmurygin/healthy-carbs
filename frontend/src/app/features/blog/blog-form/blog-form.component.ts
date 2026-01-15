import {CommonModule} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {finalize, map, of, switchMap} from 'rxjs';
import {BlogService} from '@core/services/blog/blog.service';
import {A11yModule} from '@angular/cdk/a11y';
import {setErrorNotification} from "@shared/utils";
import {NotificationService} from "@core/services/ui/notification.service";
import type {BlogPost} from "@core/models/dto/blog.dto";

interface BlogFormModel {
  title: FormControl<string>,
  summary: FormControl<string>,
  content: FormControl<string>
}

@Component({
  selector: 'app-blog-form',
  imports: [CommonModule, ReactiveFormsModule, A11yModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      (click)="onBackdropClick($event)"
      (keydown.escape)="cancel()"
      aria-modal="true"
      cdkTrapFocus
      cdkTrapFocusAutoCapture
      class="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm"
      role="dialog"
      tabindex="-1"
    >
      <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          class="relative w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white
          text-left shadow-xl transition-all animate-in fade-in zoom-in-95 duration-200"
        >
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50"
          >
            <div>
              <h3 class="text-xl font-bold text-gray-900">
                {{ titleText() }}
              </h3>
              <p class="text-sm text-gray-500 mt-1">
                {{ subtitleText() }}
              </p>
            </div>
            <button
              (click)="cancel()"
              class="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1
            hover:bg-gray-200 hover:cursor-pointer"
              type="button"
            >
              <i class="fa-solid fa-times text-lg" aria-hidden="true"></i>
              <span class="sr-only">Close</span>
            </button>
          </div>

          @if (error()) {
            <div
              class="mx-6 mt-6 rounded-lg bg-red-50 p-4 text-red-700 border border-red-100"
            >
              {{ error() }}
            </div>
          }

          <form
            [formGroup]="form"
            (ngSubmit)="submit()"
            class="p-6 sm:p-8 max-h-[80vh] overflow-y-auto"
          >
            @if (loading()) {
              <div class="py-12 flex justify-center">
                <div
                  class="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"
                ></div>
              </div>
            } @else {
              <div class="grid gap-5">
                <div>
                  <label for="title" class="mb-1 block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    formControlName="title"
                    class="w-full rounded-xl border border-gray-200 bg-white p-3
                    focus:border-transparent focus:ring-2 focus:ring-emerald-600"
                  />
                  @if (form.controls.title.touched && form.controls.title.invalid) {
                    <p class="mt-1 text-sm text-red-600">Title is required (min 3 characters).</p>
                  }
                </div>

                <div>
                  <label for="summary" class="mb-1 block text-sm font-medium text-gray-700">
                    Summary
                  </label>
                  <input
                    id="summary"
                    type="text"
                    formControlName="summary"
                    class="w-full rounded-xl border border-gray-200 bg-white p-3
                     focus:border-transparent focus:ring-2 focus:ring-emerald-600"
                  />
                  @if (form.controls.summary.touched && form.controls.summary.invalid) {
                    <p class="mt-1 text-sm text-red-600">Summary is required (min 10 characters).</p>
                  }
                </div>

                <div>
                  <label for="content" class="mb-1 block text-sm font-medium text-gray-700">
                    Content
                  </label>
                  <textarea
                    id="content"
                    formControlName="content"
                    rows="8"
                    class="w-full rounded-xl border border-gray-200 bg-white p-3
                    focus:border-transparent focus:ring-2 focus:ring-emerald-600"
                  ></textarea>
                  @if (form.controls.content.touched && form.controls.content.invalid) {
                    <p class="mt-1 text-sm text-red-600">Content is required (min 30 characters).</p>
                  }
                </div>

                <div>
                  <label for="cover-image" class="mb-1 block text-sm font-medium text-gray-700">
                    Cover image
                  </label>
                  <input
                    id="cover-image"
                    type="file"
                    accept="image/*"
                    class="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0
                  file:bg-gray-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-gray-700
                  hover:file:bg-gray-100"
                    (change)="onImageSelected($event)"
                  />
                  <p class="mt-1 text-xs text-gray-500">
                    {{ isEditMode() ? 'Upload a new image to replace the current one (optional).' : 'Optional. JPG/PNG up to 5MB.' }}
                  </p>
                </div>
              </div>
            }

            <div class="mt-8 flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                (click)="cancel()"
                [disabled]="submitting()"
                class="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300
                rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2
                focus:ring-emerald-500 cursor-pointer transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                [disabled]="form.invalid || submitting()"
                class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-emerald-600
                rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2
                focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
                shadow-sm transition-colors"
              >
                @if (submitting()) {
                  <i class="fa-solid fa-circle-notch fa-spin"></i>
                  <span>Saving…</span>
                } @else {
                  <span>{{ submitButtonText() }}</span>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class BlogFormComponent {
  readonly postId = input<number | null>(null);
  readonly cancelled = output();
  readonly success = output();
  readonly isEditMode = signal(false);
  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly selectedImageFile = signal<File | null>(null);
  readonly form = new FormGroup<BlogFormModel>({
    title: new FormControl('', {
        nonNullable: true, validators: [Validators.required, Validators.minLength(3)]
      }
    ),
    summary: new FormControl('', {
        nonNullable: true, validators: [Validators.required, Validators.minLength(10)]
      }
    ),
    content: new FormControl('', {
        nonNullable: true, validators: [Validators.required, Validators.minLength(30)]
      }
    ),
  });
  readonly titleText = computed(() => {
    return this.isEditMode() ? 'Edit Post' : 'Create Blog Post';
  });
  readonly subtitleText = computed(() => {
    return this.isEditMode() ? 'Update your article details.' : 'Write an article for knowledge base.';
  });
  readonly submitButtonText = computed(() => {
    return this.isEditMode() ? 'Update Post' : 'Create Post';
  });
  private readonly blogService = inject(BlogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly notificationService = inject(NotificationService);

  constructor() {
    effect(() => {
      const id = this.postId();
      if (id) {
        this.isEditMode.set(true);
        this.loadPostData(id);
      } else {
        this.isEditMode.set(false);
        this.form.reset();
      }
    });
  }

  loadPostData(id: number): void {
    this.loading.set(true);
    this.blogService.getPostById(id)
      .pipe(finalize(() => {
        this.loading.set(false)
      }))
      .subscribe({
        next: (post: BlogPost | null) => {
          if (!post) {
            return;
          }

          this.form.patchValue({
            title: post.title,
            summary: post.summary,
            content: post.content
          });
        },
        error: (err: unknown) => {
          setErrorNotification(this.notificationService, err, 'Could not load post details.');
        }
      });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      this.error.set('Image must be less than 5MB.');
      input.value = '';
      return;
    }

    this.selectedImageFile.set(file);
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cancel();
    }
  }

  cancel(): void {
    this.cancelled.emit();
  }

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    const formValues = this.form.getRawValue();
    const id = this.postId();

    const request$ = this.isEditMode() && id
      ? this.blogService.updatePost(id, formValues)
      : this.blogService.createPost(formValues);

    request$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((post) => {
          if (!post) {
            return of(null);
          }

          const file = this.selectedImageFile();
          if (file) {
            return this.blogService.uploadPostImage(post.id, file).pipe(map(() => post));
          }
          return of(post);
        }),
        finalize(() => {
          this.submitting.set(false)
        })
      )
      .subscribe({
        next: () => {
          this.success.emit();
        },
        error: (err: unknown) => {
          setErrorNotification(this.notificationService, err, "Unknown error");
        },
      });
  }

}
