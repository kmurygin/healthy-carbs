import type {MockedObject} from "vitest";
import {vi} from 'vitest'
import {signal} from '@angular/core';
import {type ComponentFixture, TestBed} from '@angular/core/testing';
import {of} from 'rxjs';
import {BlogListComponent} from './blog-list.component';
import type {BlogPost} from '@core/models/dto/blog.dto';
import type {Page} from '@core/models/page.model';
import {BlogService} from '@core/services/blog/blog.service';
import {AuthService} from '@core/services/auth/auth.service';
import type {JwtClaims} from '@core/services/auth/jwtclaims';
import {NotificationService} from '@core/services/ui/notification.service';

describe('BlogListComponent', () => {
  let component: BlogListComponent;
  let fixture: ComponentFixture<BlogListComponent>;
  let blogServiceSpy: MockedObject<Pick<BlogService, 'getPosts' | 'getPostImageUrl'>>;

  beforeEach(async () => {
    const authServiceStub: Pick<AuthService, 'claims'> = {claims: signal<JwtClaims | null>(null)};
    const notificationServiceStub: Pick<NotificationService, 'error'> = {
      error: vi.fn()
    };
    const mockPage: Page<BlogPost> = {
      content: [],
      totalPages: 0,
      totalElements: 0,
      size: 6,
      number: 0,
      first: true,
      last: true,
      empty: true
    };

    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    blogServiceSpy = {
      getPosts: vi.fn().mockName("BlogService.getPosts"),
      getPostImageUrl: vi.fn().mockName("BlogService.getPostImageUrl")
    };
    blogServiceSpy.getPosts.mockReturnValue(of(mockPage));
    blogServiceSpy.getPostImageUrl.mockReturnValue('/assets/placeholder.jpg');

    await TestBed.configureTestingModule({
      imports: [BlogListComponent],
      providers: [
        {provide: BlogService, useValue: blogServiceSpy},
        {provide: AuthService, useValue: authServiceStub},
        {provide: NotificationService, useValue: notificationServiceStub}
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(BlogListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
