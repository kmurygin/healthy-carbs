package org.kmurygin.healthycarbs.blog;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.kmurygin.healthycarbs.blog.model.BlogComment;
import org.kmurygin.healthycarbs.blog.model.BlogPost;
import org.kmurygin.healthycarbs.blog.repository.BlogCommentRepository;
import org.kmurygin.healthycarbs.blog.repository.BlogPostRepository;
import org.kmurygin.healthycarbs.user.UserTestUtils;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@DisplayName("BlogCommentRepository Integration Tests")
class BlogCommentRepositoryTest {

    @Autowired
    private BlogCommentRepository blogCommentRepository;

    @Autowired
    private BlogPostRepository blogPostRepository;

    @Autowired
    private UserRepository userRepository;

    private User savedUser;
    private BlogPost savedPost;

    @BeforeEach
    void setUp() {
        blogCommentRepository.deleteAll();
        blogPostRepository.deleteAll();
        userRepository.deleteAll();

        String uniqueSuffix = String.valueOf(System.currentTimeMillis());
        savedUser = userRepository.save(UserTestUtils.createRegularUserForPersistence(uniqueSuffix));

        savedPost = blogPostRepository.save(BlogPost.builder()
                .title("Test Post")
                .content("Test content")
                .summary("Test summary")
                .author(savedUser)
                .build());
    }

    @Nested
    @DisplayName("CRUD operations")
    class CrudOperationsTests {

        @Test
        @DisplayName("save_shouldPersistComment")
        void save_shouldPersistComment() {
            BlogComment comment = blogCommentRepository.save(BlogComment.builder()
                    .content("Test comment")
                    .author(savedUser)
                    .post(savedPost)
                    .build());

            assertThat(comment.getId()).isNotNull();
            assertThat(blogCommentRepository.findById(comment.getId())).isPresent();
        }

        @Test
        @DisplayName("findById_shouldReturnComment")
        void findById_shouldReturnComment() {
            BlogComment saved = blogCommentRepository.save(BlogComment.builder()
                    .content("Test comment")
                    .author(savedUser)
                    .post(savedPost)
                    .build());

            Optional<BlogComment> result = blogCommentRepository.findById(saved.getId());

            assertThat(result).isPresent();
            assertThat(result.get().getContent()).isEqualTo("Test comment");
        }

        @Test
        @DisplayName("findById_whenNotFound_shouldReturnEmpty")
        void findById_whenNotFound_shouldReturnEmpty() {
            Optional<BlogComment> result = blogCommentRepository.findById(999L);

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("delete_shouldRemoveComment")
        void delete_shouldRemoveComment() {
            BlogComment comment = blogCommentRepository.save(BlogComment.builder()
                    .content("Test comment")
                    .author(savedUser)
                    .post(savedPost)
                    .build());

            Long commentId = comment.getId();
            blogCommentRepository.delete(comment);

            assertThat(blogCommentRepository.findById(commentId)).isEmpty();
        }

        @Test
        @DisplayName("findAll_shouldReturnAllComments")
        void findAll_shouldReturnAllComments() {
            blogCommentRepository.save(BlogComment.builder()
                    .content("First comment")
                    .author(savedUser)
                    .post(savedPost)
                    .build());

            blogCommentRepository.save(BlogComment.builder()
                    .content("Second comment")
                    .author(savedUser)
                    .post(savedPost)
                    .build());

            List<BlogComment> result = blogCommentRepository.findAll();

            assertThat(result).hasSize(2);
        }

        @Test
        @DisplayName("save_shouldUpdateExistingComment")
        void save_shouldUpdateExistingComment() {
            BlogComment comment = blogCommentRepository.save(BlogComment.builder()
                    .content("Original content")
                    .author(savedUser)
                    .post(savedPost)
                    .build());

            comment.setContent("Updated content");
            blogCommentRepository.save(comment);

            Optional<BlogComment> updated = blogCommentRepository.findById(comment.getId());
            assertThat(updated).isPresent();
            assertThat(updated.get().getContent()).isEqualTo("Updated content");
        }
    }

    @Nested
    @DisplayName("Relationship tests")
    class RelationshipTests {

        @Test
        @DisplayName("comment_shouldBeLinkedToPost")
        void comment_shouldBeLinkedToPost() {
            BlogComment comment = blogCommentRepository.save(BlogComment.builder()
                    .content("Test comment")
                    .author(savedUser)
                    .post(savedPost)
                    .build());

            Optional<BlogComment> result = blogCommentRepository.findById(comment.getId());

            assertThat(result).isPresent();
            assertThat(result.get().getPost().getId()).isEqualTo(savedPost.getId());
        }

        @Test
        @DisplayName("comment_shouldBeLinkedToAuthor")
        void comment_shouldBeLinkedToAuthor() {
            BlogComment comment = blogCommentRepository.save(BlogComment.builder()
                    .content("Test comment")
                    .author(savedUser)
                    .post(savedPost)
                    .build());

            Optional<BlogComment> result = blogCommentRepository.findById(comment.getId());

            assertThat(result).isPresent();
            assertThat(result.get().getAuthor().getId()).isEqualTo(savedUser.getId());
        }
    }
}
