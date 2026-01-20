import {type ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';

import {BlogPostCardComponent} from './blog-post-card.component';

describe('BlogPostCardComponent', () => {
  let component: BlogPostCardComponent;
  let fixture: ComponentFixture<BlogPostCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogPostCardComponent],
      providers: [provideRouter([])]
    })
      .compileComponents();

    fixture = TestBed.createComponent(BlogPostCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('blogPost', {
      id: '1',
      title: 'Test Post',
      content: 'Content',
      summary: 'Summary',
      author: {firstName: 'Tom', lastName: 'Riddle', id: 'u1', email: 'test@test.com', role: 'ROLE_DIETITIAN'},
      createdAt: '2026-01-01',
      comments: []
    });
    fixture.componentRef.setInput('coverUrl', 'test.jpg');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
