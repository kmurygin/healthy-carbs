package org.kmurygin.healthycarbs.blog;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.kmurygin.healthycarbs.blog.model.BlogPost;
import org.kmurygin.healthycarbs.blog.repository.BlogPostRepository;
import org.kmurygin.healthycarbs.user.UserTestUtils;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@DisplayName("BlogPostRepository Integration Tests")
class BlogPostRepositoryTest {

    @Autowired
    private BlogPostRepository blogPostRepository;

    @Autowired
    private UserRepository userRepository;

    private User savedUser;

    @BeforeEach
    void setUp() {
        blogPostRepository.deleteAll();
        userRepository.deleteAll();

        String uniqueSuffix = String.valueOf(System.currentTimeMillis());
        savedUser = userRepository.save(UserTestUtils.createDietitianForPersistence(uniqueSuffix));
    }

    @Nested
    @DisplayName("findAllByOrderByCreatedAtDesc")
    class FindAllOrderedTests {

        @Test
        @DisplayName("findAllByOrderByCreatedAtDesc_shouldReturnPostsOrderedByDate")
        void findAllByOrderByCreatedAtDesc_shouldReturnPostsOrderedByDate() throws InterruptedException {
            BlogPost post1 = blogPostRepository.save(BlogPost.builder()
                    .title("First Post")
                    .content("First content")
                    .summary("First summary")
                    .author(savedUser)
                    .build());

            Thread.sleep(10);

            BlogPost post2 = blogPostRepository.save(BlogPost.builder()
                    .title("Second Post")
                    .content("Second content")
                    .summary("Second summary")
                    .author(savedUser)
                    .build());

            Page<BlogPost> result = blogPostRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 10));

            assertThat(result.getContent()).hasSize(2);
            assertThat(result.getContent().get(0).getTitle()).isEqualTo("Second Post");
            assertThat(result.getContent().get(1).getTitle()).isEqualTo("First Post");
        }

        @Test
        @DisplayName("findAllByOrderByCreatedAtDesc_whenEmpty_shouldReturnEmptyPage")
        void findAllByOrderByCreatedAtDesc_whenEmpty_shouldReturnEmptyPage() {
            Page<BlogPost> result = blogPostRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 10));

            assertThat(result.getContent()).isEmpty();
        }

        @Test
        @DisplayName("findAllByOrderByCreatedAtDesc_shouldRespectPagination")
        void findAllByOrderByCreatedAtDesc_shouldRespectPagination() {
            for (int i = 0; i < 15; i++) {
                blogPostRepository.save(BlogPost.builder()
                        .title("Post " + i)
                        .content("Content " + i)
                        .summary("Summary " + i)
                        .author(savedUser)
                        .build());
            }

            Page<BlogPost> firstPage = blogPostRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 10));
            Page<BlogPost> secondPage = blogPostRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(1, 10));

            assertThat(firstPage.getContent()).hasSize(10);
            assertThat(secondPage.getContent()).hasSize(5);
            assertThat(firstPage.getTotalElements()).isEqualTo(15);
        }
    }

    @Nested
    @DisplayName("CRUD operations")
    class CrudOperationsTests {

        @Test
        @DisplayName("save_shouldPersistPost")
        void save_shouldPersistPost() {
            BlogPost post = blogPostRepository.save(BlogPost.builder()
                    .title("Test Post")
                    .content("Test content")
                    .summary("Test summary")
                    .author(savedUser)
                    .build());

            assertThat(post.getId()).isNotNull();
            assertThat(blogPostRepository.findById(post.getId())).isPresent();
        }

        @Test
        @DisplayName("findById_shouldReturnPost")
        void findById_shouldReturnPost() {
            BlogPost saved = blogPostRepository.save(BlogPost.builder()
                    .title("Test Post")
                    .content("Test content")
                    .summary("Test summary")
                    .author(savedUser)
                    .build());

            Optional<BlogPost> result = blogPostRepository.findById(saved.getId());

            assertThat(result).isPresent();
            assertThat(result.get().getTitle()).isEqualTo("Test Post");
        }

        @Test
        @DisplayName("findById_whenNotFound_shouldReturnEmpty")
        void findById_whenNotFound_shouldReturnEmpty() {
            Optional<BlogPost> result = blogPostRepository.findById(999L);

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("delete_shouldRemovePost")
        void delete_shouldRemovePost() {
            BlogPost post = blogPostRepository.save(BlogPost.builder()
                    .title("Test Post")
                    .content("Test content")
                    .summary("Test summary")
                    .author(savedUser)
                    .build());

            Long postId = post.getId();
            blogPostRepository.delete(post);

            assertThat(blogPostRepository.findById(postId)).isEmpty();
        }

        @Test
        @DisplayName("save_shouldUpdateExistingPost")
        void save_shouldUpdateExistingPost() {
            BlogPost post = blogPostRepository.save(BlogPost.builder()
                    .title("Original Title")
                    .content("Original content")
                    .summary("Original summary")
                    .author(savedUser)
                    .build());

            post.setTitle("Updated Title");
            post.setContent("Updated content");
            blogPostRepository.save(post);

            Optional<BlogPost> updated = blogPostRepository.findById(post.getId());
            assertThat(updated).isPresent();
            assertThat(updated.get().getTitle()).isEqualTo("Updated Title");
            assertThat(updated.get().getContent()).isEqualTo("Updated content");
        }
    }
}
