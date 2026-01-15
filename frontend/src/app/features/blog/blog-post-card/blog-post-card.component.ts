import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {DatePipe, NgOptimizedImage} from '@angular/common';
import {RouterLink} from '@angular/router';
import type {BlogPost} from "@core/models/dto/blog.dto";

@Component({
  selector: 'app-blog-post-card',
  standalone: true,
  imports: [DatePipe, RouterLink, NgOptimizedImage],
  template: `
    @let post = blogPost();
    <a
      [routerLink]="['/blog', post.id]"
      class="group block h-full"
    >
      <div
        class="relative h-full flex flex-col rounded-2xl bg-white border border-gray-200 shadow-sm
        overflow-hidden transition-all group-hover:-translate-y-1 group-hover:shadow-md"
      >
        @if (coverUrl()) {
          <div class="relative h-48 w-full shrink-0 overflow-hidden bg-gray-100">
            <img
              [ngSrc]="coverUrl()"
              alt="Post cover"
              fill
              class="object-cover"
            />
          </div>
        }

        <div class="flex flex-1 flex-col p-6">
          <div class="mb-3 flex items-start justify-end gap-3">
            <span class="text-xs text-gray-500 whitespace-nowrap">
              {{ post.createdAt | date: 'fullDate' }}
            </span>
          </div>

          <h3
            class="text-lg font-bold text-gray-900 transition-colors group-hover:text-emerald-600
            line-clamp-2 min-h-14"
          >
            {{ post.title }}
          </h3>

          <p class="mt-2 text-sm leading-6 text-gray-500 line-clamp-3">
            {{ post.summary || post.content }}
          </p>

          <div class="mt-auto flex items-center justify-between gap-3 pt-6 text-sm">
            <span class="text-gray-500 truncate">
              By
              <span class="font-semibold text-gray-900">
                {{ post.author.firstName }} {{ post.author.lastName }}
              </span>
            </span>

            <span class="text-gray-500 whitespace-nowrap">
              Comments:
              <span class="font-semibold text-gray-900">
                {{ post.comments?.length ?? 0 }}
              </span>
            </span>
          </div>
        </div>
      </div>
    </a>
  `,
  host: {
    class: 'block h-full'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogPostCardComponent {
  readonly blogPost = input.required<BlogPost>();
  readonly coverUrl = input.required<string>();
}
