import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {catchError, EMPTY, map, merge, Subject, switchMap, tap} from 'rxjs';
import {BlogService} from '@core/services/blog/blog.service';
import type {BlogPost} from '@core/models/dto/blog.dto';
import type {Page} from '@core/models/page.model';
import {PageSizeSelectorComponent} from '@features/recipes-list/page-size-selector/page-size-selector.component';
import {PaginationControlsComponent} from '@features/recipes-list/pagination-controls/pagination-controls.component';
import {BlogPostCardComponent} from '@features/blog/blog-post-card/blog-post-card.component';
import {AuthService} from "@core/services/auth/auth.service";
import {BlogFormComponent} from "@features/blog/blog-form/blog-form.component";
import {NotificationService} from "@core/services/ui/notification.service";
import {setErrorNotification} from "@shared/utils";
import {UserRole} from "@core/models/enum/user-role.enum";

@Component({
  selector: 'app-blog-list',
  imports: [
    CommonModule,
    PageSizeSelectorComponent,
    PaginationControlsComponent,
    BlogPostCardComponent,
    BlogFormComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-gray-50/50 p-6 lg:p-10">
      <div class="max-w-7xl mx-auto">

        <header class="mb-10">
          <div class="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Knowledge Base
              </h1>
            </div>

            @if (canCreate()) {
              <button
                (click)="openCreateForm()"
                class="mt-4 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2
                text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 sm:mt-0
                hover:cursor-pointer"
              >
                <i class="fa-solid fa-plus mr-2"></i>
                Create post
              </button>
            }
          </div>
        </header>

        @if (error()) {
          <div class="mb-6 rounded-lg bg-red-50 p-4 text-red-700 border border-red-100">
            {{ error() }}
          </div>
        }

        <div class="relative min-h-[400px]">
          @if (!loading() && posts().length === 0) {
            <div class="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
              <h3 class="mt-2 text-sm font-semibold text-gray-900">No posts yet</h3>
              <p class="mt-1 text-sm text-gray-500">Create your first blog post to share knowledge.</p>
            </div>
          } @else {
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 pb-8">
              @for (post of posts(); track post.id) {
                <app-blog-post-card
                  [blogPost]="post"
                  [coverUrl]="getCoverUrl(post.imageId)"
                />
              }
            </div>
          }
        </div>

        @if (pageResponseData(); as page) {
          <div class="mt-8 overflow-hidden border-t border-gray-200 pt-6">
            <div class="grid items-center gap-6 grid-cols-[1fr_auto_1fr]">
              <div class="justify-self-start min-w-0">
                <app-page-size-selector
                  [pageSize]="size()"
                  [pageSizeOptions]="pageSizeOptions()"
                  (pageSizeChange)="onPageSizeChange($event)"
                />
              </div>

              <div class="justify-self-center">
                <app-pagination-controls
                  [pageNumber]="page.number + 1"
                  [totalPages]="page.totalPages"
                  (previousPage)="onPreviousPage()"
                  (nextPage)="onNextPage()"
                />
              </div>

              <div class="justify-self-end whitespace-nowrap text-sm text-gray-600">
                Total:
                <span class="font-semibold text-gray-900">{{ page.totalElements }}</span>
              </div>
            </div>
          </div>
        }
      </div>

      @if (showForm()) {
        <app-blog-form
          (cancelled)="closeForm()"
          (success)="onFormSuccess()"
        />
      }
    </div>
  `,
})
export class BlogListComponent {
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly page = signal(0);
  readonly size = signal(6);
  readonly pageSizeOptions = signal<readonly number[]>([6, 12, 24]);
  readonly showForm = signal(false);

  private readonly blogService = inject(BlogService);
  private readonly authService = inject(AuthService);
  readonly canCreate = computed(() => {
    const claims = this.authService.claims();
    return claims && (claims.role === UserRole.DIETITIAN || claims.role === UserRole.ADMIN);
  });
  private readonly notificationService = inject(NotificationService);
  private readonly refreshTrigger$ = new Subject<void>();
  private readonly pageResponse = signal<Page<BlogPost> | null>(null);
  readonly posts = computed(() => this.pageResponse()?.content ?? []);
  readonly pageResponseData = computed(() => this.pageResponse());

  private readonly loadRequest$ = merge(
    toObservable(this.page).pipe(map(page => ({page, size: this.size()}))),
    toObservable(this.size).pipe(map(size => ({page: 0, size}))),
    this.refreshTrigger$.pipe(map(() => ({page: this.page(), size: this.size()})))
  );

  constructor() {
    this.loadRequest$.pipe(
      takeUntilDestroyed(),
      tap(() => {
        this.loading.set(true);
        this.error.set(null);
      }),
      switchMap(({page, size}) =>
        this.blogService.getPosts(page, size).pipe(
          catchError((err: unknown) => {
            setErrorNotification(this.notificationService, err, "Error loading posts.");
            return EMPTY;
          }),
        )
      )
    ).subscribe(page => {
      this.pageResponse.set(page);
      this.loading.set(false);
    });
  }

  getCoverUrl(imageId: number | undefined | null): string {
    return imageId
      ? this.blogService.getPostImageUrl(imageId)
      : '';
  }

  openCreateForm(): void {
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  onFormSuccess(): void {
    this.closeForm();
    this.refreshTrigger$.next();
  }

  onPageSizeChange(newSize: number): void {
    if (newSize === this.size()) return;
    this.size.set(newSize);
  }

  onNextPage(): void {
    const page = this.pageResponseData();
    if (!page || page.last) return;
    this.page.update(pageIndex => pageIndex + 1);
  }

  onPreviousPage(): void {
    const page = this.pageResponseData();
    if (!page || page.first) return;
    this.page.update(pageIndex => Math.max(0, pageIndex - 1));
  }
}
