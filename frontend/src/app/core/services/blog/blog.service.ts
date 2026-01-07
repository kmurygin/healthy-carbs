import {HttpClient, HttpParams} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {map, type Observable} from 'rxjs';
import type {ApiResponse} from '../../models/api-response.model';
import type {Page} from '@core/models/page.model';
import type {BlogComment, BlogPost, CreateBlogCommentRequest, CreateBlogPostRequest,} from '@core/models/dto/blog.dto';
import {ApiEndpoints} from "@core/constants/api-endpoints";

@Injectable({providedIn: 'root'})
export class BlogService {
  private readonly httpClient = inject(HttpClient);

  getPosts(page = 0, size = 6): Observable<Page<BlogPost> | null> {
    const httpParams: HttpParams = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.httpClient
      .get<ApiResponse<Page<BlogPost>>>(ApiEndpoints.Blog.Base, {
        params: httpParams,
      })
      .pipe(
        map(response => response.data ?? null)
      );
  }

  getPostById(id: number): Observable<BlogPost | null> {
    return this.httpClient
      .get<ApiResponse<BlogPost>>(ApiEndpoints.Blog.Post(id))
      .pipe(
        map(response => response.data ?? null)
      );
  }

  createPost(req: CreateBlogPostRequest): Observable<BlogPost | null> {
    return this.httpClient
      .post<ApiResponse<BlogPost>>(ApiEndpoints.Blog.Base, req)
      .pipe(
        map(response => response.data ?? null)
      );
  }

  updatePost(id: number, req: CreateBlogPostRequest): Observable<BlogPost | null> {
    return this.httpClient
      .put<ApiResponse<BlogPost>>(ApiEndpoints.Blog.Post(id), req)
      .pipe(
        map(response => response.data ?? null)
      );
  }

  deletePost(id: number): Observable<void> {
    return this.httpClient
      .delete<ApiResponse<void>>(ApiEndpoints.Blog.Post(id))
      .pipe(map(() => void 0));
  }

  addComment(postId: number, req: CreateBlogCommentRequest): Observable<BlogComment | null> {
    return this.httpClient
      .post<ApiResponse<BlogComment>>(ApiEndpoints.Blog.AddComment(postId), req)
      .pipe(
        map(response => response.data ?? null)
      );
  }

  deleteComment(commentId: number): Observable<void> {
    return this.httpClient
      .delete<ApiResponse<void>>(ApiEndpoints.Blog.DeleteComment(commentId))
      .pipe(
        map(() => void 0)
      );
  }

  uploadPostImage(postId: number, file: File): Observable<void> {
    const formData = new FormData();
    formData.append('file', file);

    return this.httpClient
      .post<ApiResponse<void>>(ApiEndpoints.Blog.UploadImage(postId), formData)
      .pipe(
        map(() => void 0)
      );
  }

  getPostImageUrl(imageId: number): string {
    return ApiEndpoints.Blog.GetImage(imageId);
  }

}
