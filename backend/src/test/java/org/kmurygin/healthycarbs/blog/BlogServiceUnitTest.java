package org.kmurygin.healthycarbs.blog;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.kmurygin.healthycarbs.blog.model.BlogComment;
import org.kmurygin.healthycarbs.blog.model.BlogPost;
import org.kmurygin.healthycarbs.blog.model.BlogPostImage;
import org.kmurygin.healthycarbs.blog.repository.BlogCommentRepository;
import org.kmurygin.healthycarbs.blog.repository.BlogPostImageRepository;
import org.kmurygin.healthycarbs.blog.repository.BlogPostRepository;
import org.kmurygin.healthycarbs.blog.service.BlogService;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.storage.StorageProperties;
import org.kmurygin.healthycarbs.storage.StorageProvider;
import org.kmurygin.healthycarbs.user.UserTestUtils;
import org.kmurygin.healthycarbs.user.model.User;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("BlogService Unit Tests")
class BlogServiceUnitTest {

    @Mock
    private BlogPostRepository blogPostRepository;

    @Mock
    private BlogCommentRepository blogCommentRepository;

    @Mock
    private BlogPostImageRepository blogPostImageRepository;

    @Mock
    private StorageProvider storageProvider;

    @Mock
    private StorageProperties storageProperties;

    @Mock
    private TransactionTemplate transactionTemplate;

    private BlogService blogService;

    private User testUser;
    private User adminUser;
    private BlogPost testPost;

    @BeforeEach
    void setUp() {
        blogService = new BlogService(
                blogPostRepository,
                blogCommentRepository,
                blogPostImageRepository,
                storageProvider,
                storageProperties,
                transactionTemplate);

        testUser = UserTestUtils.createTestUser(1L, "testuser");

        adminUser = UserTestUtils.createAdmin();
        adminUser.setId(2L);

        testPost = BlogPost.builder()
                .id(1L)
                .title("Test Post")
                .content("Test content")
                .summary("Test summary")
                .author(testUser)
                .build();
    }

    @Nested
    @DisplayName("findAllPosts")
    class FindAllPostsTests {

        @Test
        @DisplayName("findAllPosts_shouldReturnPaginatedPosts")
        void findAllPosts_shouldReturnPaginatedPosts() {
            Pageable pageable = PageRequest.of(0, 10);
            Page<BlogPost> expectedPage = new PageImpl<>(List.of(testPost));

            when(blogPostRepository.findAllByOrderByCreatedAtDesc(pageable)).thenReturn(expectedPage);

            Page<BlogPost> result = blogService.findAllPosts(pageable);

            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0)).isEqualTo(testPost);
            verify(blogPostRepository).findAllByOrderByCreatedAtDesc(pageable);
        }

        @Test
        @DisplayName("findAllPosts_whenEmpty_shouldReturnEmptyPage")
        void findAllPosts_whenEmpty_shouldReturnEmptyPage() {
            Pageable pageable = PageRequest.of(0, 10);
            Page<BlogPost> emptyPage = Page.empty();

            when(blogPostRepository.findAllByOrderByCreatedAtDesc(pageable)).thenReturn(emptyPage);

            Page<BlogPost> result = blogService.findAllPosts(pageable);

            assertThat(result.getContent()).isEmpty();
        }
    }

    @Nested
    @DisplayName("findPostById")
    class FindPostByIdTests {

        @Test
        @DisplayName("findPostById_whenPostExists_shouldReturnPost")
        void findPostById_whenPostExists_shouldReturnPost() {
            when(blogPostRepository.findById(1L)).thenReturn(Optional.of(testPost));

            BlogPost result = blogService.findPostById(1L);

            assertThat(result).isEqualTo(testPost);
        }

        @Test
        @DisplayName("findPostById_whenPostNotFound_shouldThrowResourceNotFound")
        void findPostById_whenPostNotFound_shouldThrowResourceNotFound() {
            when(blogPostRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> blogService.findPostById(999L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Blog post not found");
        }
    }

    @Nested
    @DisplayName("createPost")
    class CreatePostTests {

        @Test
        @DisplayName("createPost_shouldSetAuthorAndSave")
        void createPost_shouldSetAuthorAndSave() {
            BlogPost newPost = BlogPost.builder()
                    .title("New Post")
                    .content("New content")
                    .summary("New summary")
                    .build();

            when(blogPostRepository.save(any(BlogPost.class))).thenAnswer(i -> {
                BlogPost p = i.getArgument(0);
                p.setId(2L);
                return p;
            });

            BlogPost result = blogService.createPost(newPost, testUser);

            assertThat(result.getAuthor()).isEqualTo(testUser);
            verify(blogPostRepository).save(newPost);
        }
    }

    @Nested
    @DisplayName("deletePost")
    class DeletePostTests {

        @Test
        @DisplayName("deletePost_whenPostExists_shouldDelete")
        void deletePost_whenPostExists_shouldDelete() {
            when(blogPostRepository.findById(1L)).thenReturn(Optional.of(testPost));

            blogService.deletePost(1L);

            verify(blogPostRepository).delete(testPost);
        }

        @Test
        @DisplayName("deletePost_whenPostHasImage_shouldDeleteImageFromStorage")
        void deletePost_whenPostHasImage_shouldDeleteImageFromStorage() {
            BlogPostImage image = BlogPostImage.builder()
                    .id(1L)
                    .imageKey("blog-images/1/image.jpg")
                    .imageUrl("https://example.com/image.jpg")
                    .build();
            testPost.setImage(image);

            when(blogPostRepository.findById(1L)).thenReturn(Optional.of(testPost));

            blogService.deletePost(1L);

            verify(blogPostRepository).delete(testPost);
            verify(storageProvider).deleteFileByKey("blog-images/1/image.jpg");
        }

        @Test
        @DisplayName("deletePost_whenPostNotFound_shouldThrowResourceNotFound")
        void deletePost_whenPostNotFound_shouldThrowResourceNotFound() {
            when(blogPostRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> blogService.deletePost(999L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("updatePost")
    class UpdatePostTests {

        @Test
        @DisplayName("updatePost_shouldUpdateFields")
        void updatePost_shouldUpdateFields() {
            BlogPost updatedDetails = BlogPost.builder()
                    .title("Updated Title")
                    .content("Updated content")
                    .summary("Updated summary")
                    .build();

            when(blogPostRepository.findById(1L)).thenReturn(Optional.of(testPost));
            when(blogPostRepository.save(any(BlogPost.class))).thenAnswer(i -> i.getArgument(0));

            BlogPost result = blogService.updatePost(1L, updatedDetails, testUser);

            assertThat(result.getTitle()).isEqualTo("Updated Title");
            assertThat(result.getContent()).isEqualTo("Updated content");
            assertThat(result.getSummary()).isEqualTo("Updated summary");
        }

        @Test
        @DisplayName("updatePost_whenPostNotFound_shouldThrowResourceNotFound")
        void updatePost_whenPostNotFound_shouldThrowResourceNotFound() {
            when(blogPostRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> blogService.updatePost(999L, testPost, testUser))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("addComment")
    class AddCommentTests {

        @Test
        @DisplayName("addComment_shouldCreateAndSaveComment")
        void addComment_shouldCreateAndSaveComment() {
            when(blogPostRepository.findById(1L)).thenReturn(Optional.of(testPost));
            when(blogCommentRepository.save(any(BlogComment.class))).thenAnswer(i -> {
                BlogComment c = i.getArgument(0);
                c.setId(1L);
                return c;
            });

            BlogComment result = blogService.addComment(1L, "Nice post!", testUser);

            assertThat(result.getContent()).isEqualTo("Nice post!");
            assertThat(result.getAuthor()).isEqualTo(testUser);
            assertThat(result.getPost()).isEqualTo(testPost);
            verify(blogCommentRepository).save(any(BlogComment.class));
        }

        @Test
        @DisplayName("addComment_whenPostNotFound_shouldThrowResourceNotFound")
        void addComment_whenPostNotFound_shouldThrowResourceNotFound() {
            when(blogPostRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> blogService.addComment(999L, "Comment", testUser))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("deleteComment")
    class DeleteCommentTests {

        @Test
        @DisplayName("deleteComment_whenCommentAuthor_shouldDelete")
        void deleteComment_whenCommentAuthor_shouldDelete() {
            BlogComment comment = BlogComment.builder()
                    .id(1L)
                    .content("Test comment")
                    .author(testUser)
                    .post(testPost)
                    .build();

            when(blogCommentRepository.findById(1L)).thenReturn(Optional.of(comment));

            blogService.deleteComment(1L, testUser);

            verify(blogCommentRepository).delete(comment);
        }

        @Test
        @DisplayName("deleteComment_whenPostAuthor_shouldDelete")
        void deleteComment_whenPostAuthor_shouldDelete() {
            User commentAuthor = UserTestUtils.createTestUser(3L, "other");
            BlogComment comment = BlogComment.builder()
                    .id(1L)
                    .content("Test comment")
                    .author(commentAuthor)
                    .post(testPost)
                    .build();

            when(blogCommentRepository.findById(1L)).thenReturn(Optional.of(comment));

            blogService.deleteComment(1L, testUser);

            verify(blogCommentRepository).delete(comment);
        }

        @Test
        @DisplayName("deleteComment_whenAdmin_shouldDelete")
        void deleteComment_whenAdmin_shouldDelete() {
            User commentAuthor = UserTestUtils.createTestUser(3L, "other");
            User postAuthor = UserTestUtils.createTestUser(4L, "postauthor");
            testPost.setAuthor(postAuthor);

            BlogComment comment = BlogComment.builder()
                    .id(1L)
                    .content("Test comment")
                    .author(commentAuthor)
                    .post(testPost)
                    .build();

            when(blogCommentRepository.findById(1L)).thenReturn(Optional.of(comment));

            blogService.deleteComment(1L, adminUser);

            verify(blogCommentRepository).delete(comment);
        }

        @Test
        @DisplayName("deleteComment_whenUnauthorized_shouldThrowAccessDenied")
        void deleteComment_whenUnauthorized_shouldThrowAccessDenied() {
            User commentAuthor = UserTestUtils.createTestUser(3L, "other");
            User postAuthor = UserTestUtils.createTestUser(4L, "postauthor");
            User unauthorizedUser = UserTestUtils.createTestUser(5L, "unauthorized");
            testPost.setAuthor(postAuthor);

            BlogComment comment = BlogComment.builder()
                    .id(1L)
                    .content("Test comment")
                    .author(commentAuthor)
                    .post(testPost)
                    .build();

            when(blogCommentRepository.findById(1L)).thenReturn(Optional.of(comment));

            assertThatThrownBy(() -> blogService.deleteComment(1L, unauthorizedUser))
                    .isInstanceOf(AccessDeniedException.class)
                    .hasMessageContaining("not authorized");
        }

        @Test
        @DisplayName("deleteComment_whenCommentNotFound_shouldThrowResourceNotFound")
        void deleteComment_whenCommentNotFound_shouldThrowResourceNotFound() {
            when(blogCommentRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> blogService.deleteComment(999L, testUser))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("getPostImageById")
    class GetPostImageByIdTests {

        @Test
        @DisplayName("getPostImageById_whenImageExists_shouldReturnImage")
        void getPostImageById_whenImageExists_shouldReturnImage() {
            BlogPostImage image = BlogPostImage.builder()
                    .id(1L)
                    .imageKey("blog-images/1/image.jpg")
                    .imageUrl("https://example.com/image.jpg")
                    .build();

            when(blogPostImageRepository.findById(1L)).thenReturn(Optional.of(image));

            BlogPostImage result = blogService.getPostImageById(1L);

            assertThat(result).isEqualTo(image);
        }

        @Test
        @DisplayName("getPostImageById_whenImageNotFound_shouldThrowResourceNotFound")
        void getPostImageById_whenImageNotFound_shouldThrowResourceNotFound() {
            when(blogPostImageRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> blogService.getPostImageById(999L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }
}
