import {TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient} from '@angular/common/http';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

import {BlogService} from './blog.service';
import {ApiEndpoints} from '@core/constants/api-endpoints';
import type {CreateBlogPostRequest} from '@core/models/dto/blog.dto';

describe('BlogService', () => {
  let service: BlogService;
  let httpMock: HttpTestingController;

  const mockPost = {
    id: 1,
    title: 'Test',
    content: 'Content',
    author: null,
    createdAt: '2026-01-01',
    comments: [],
    imageId: null
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BlogService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(BlogService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('service_whenInjected_shouldBeTruthy', () => {
    expect(service).toBeTruthy();
  });

  describe('getPosts', () => {
    it('getPosts_whenSuccess_shouldReturnPage', () => {
      const mockPage = {
        content: [mockPost],
        totalPages: 1,
        totalElements: 1,
        size: 6,
        number: 0,
        first: true,
        last: true,
        empty: false
      };

      service.getPosts(0, 6).subscribe((page) => {
        expect(page).toEqual(mockPage);
      });

      const req = httpMock.expectOne((r) => r.url === ApiEndpoints.Blog.Base);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('0');
      expect(req.request.params.get('size')).toBe('6');
      req.flush({data: mockPage});
    });

    it('getPosts_whenDataNull_shouldReturnNull', () => {
      service.getPosts().subscribe((page) => {
        expect(page).toBeNull();
      });

      const req = httpMock.expectOne((r) => r.url === ApiEndpoints.Blog.Base);
      req.flush({data: null});
    });
  });

  describe('getPostById', () => {
    it('getPostById_whenFound_shouldReturnPost', () => {
      service.getPostById(1).subscribe((post) => {
        expect(post).toEqual(mockPost);
      });

      const req = httpMock.expectOne(ApiEndpoints.Blog.Post(1));
      expect(req.request.method).toBe('GET');
      req.flush({data: mockPost});
    });

    it('getPostById_whenDataNull_shouldReturnNull', () => {
      service.getPostById(1).subscribe((post) => {
        expect(post).toBeNull();
      });

      const req = httpMock.expectOne(ApiEndpoints.Blog.Post(1));
      req.flush({data: null});
    });
  });

  describe('createPost', () => {
    it('createPost_whenSuccess_shouldReturnPost', () => {
      const createReq: CreateBlogPostRequest = {title: 'New', summary: 'Summary', content: 'New content'};

      service.createPost(createReq).subscribe((post) => {
        expect(post).toEqual(mockPost);
      });

      const req = httpMock.expectOne(ApiEndpoints.Blog.Base);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createReq);
      req.flush({data: mockPost});
    });

    it('createPost_whenDataNull_shouldReturnNull', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const invalidReq: CreateBlogPostRequest = {} as any;
      service.createPost(invalidReq).subscribe((post) => {
        expect(post).toBeNull();
      });

      const req = httpMock.expectOne(ApiEndpoints.Blog.Base);
      req.flush({data: null});
    });
  });

  describe('updatePost', () => {
    it('updatePost_whenSuccess_shouldReturnUpdatedPost', () => {
      const updateReq: CreateBlogPostRequest = {title: 'Updated', summary: 'Summary', content: 'Updated content'};

      service.updatePost(1, updateReq).subscribe((post) => {
        expect(post).toEqual(mockPost);
      });

      const req = httpMock.expectOne(ApiEndpoints.Blog.Post(1));
      expect(req.request.method).toBe('PUT');
      req.flush({data: mockPost});
    });

    it('updatePost_whenDataNull_shouldReturnNull', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const invalidReq: CreateBlogPostRequest = {} as any;
      service.updatePost(1, invalidReq).subscribe((post) => {
        expect(post).toBeNull();
      });

      const req = httpMock.expectOne(ApiEndpoints.Blog.Post(1));
      req.flush({data: null});
    });
  });

  describe('deletePost', () => {
    it('deletePost_whenSuccess_shouldReturnVoid', () => {
      service.deletePost(1).subscribe((result) => {
        expect(result).toBeUndefined();
      });

      const req = httpMock.expectOne(ApiEndpoints.Blog.Post(1));
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  describe('addComment', () => {
    it('addComment_whenSuccess_shouldReturnComment', () => {
      const mockComment = {id: 1, content: 'Nice', author: null, createdAt: '2026-01-01'};

      service.addComment(1, {content: 'Nice'}).subscribe((comment) => {
        expect(comment).toEqual(mockComment);
      });

      const req = httpMock.expectOne(ApiEndpoints.Blog.AddComment(1));
      expect(req.request.method).toBe('POST');
      req.flush({data: mockComment});
    });
  });

  describe('deleteComment', () => {
    it('deleteComment_whenSuccess_shouldReturnVoid', () => {
      service.deleteComment(5).subscribe((result) => {
        expect(result).toBeUndefined();
      });

      const req = httpMock.expectOne(ApiEndpoints.Blog.DeleteComment(5));
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  describe('uploadPostImage', () => {
    it('uploadPostImage_whenSuccess_shouldPostFormData', () => {
      const file = new File(['img'], 'test.png', {type: 'image/png'});

      service.uploadPostImage(1, file).subscribe((result) => {
        expect(result).toBeUndefined();
      });

      const req = httpMock.expectOne(ApiEndpoints.Blog.UploadImage(1));
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBe(true);
      req.flush({});
    });
  });

  describe('getPostImageUrl', () => {
    it('getPostImageUrl_whenCalled_shouldReturnUrl', () => {
      const url = service.getPostImageUrl(42);
      expect(url).toBe(ApiEndpoints.Blog.GetImage(42));
    });
  });
});
