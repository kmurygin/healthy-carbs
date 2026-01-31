package org.kmurygin.healthycarbs.blog;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.kmurygin.healthycarbs.blog.dto.CreateBlogCommentRequest;
import org.kmurygin.healthycarbs.blog.dto.CreateBlogPostRequest;
import org.kmurygin.healthycarbs.blog.model.BlogPost;
import org.kmurygin.healthycarbs.blog.repository.BlogPostRepository;
import org.kmurygin.healthycarbs.config.JwtService;
import org.kmurygin.healthycarbs.storage.StorageProvider;
import org.kmurygin.healthycarbs.user.UserTestUtils;
import org.kmurygin.healthycarbs.user.model.Role;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.isA;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("BlogController Integration Tests")
class BlogControllerIntegrationTest {

    private static final String BASE_URL = "/api/v1/blog";
    private final String uniqueSuffix = String.valueOf(System.currentTimeMillis());
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private BlogPostRepository blogPostRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtService jwtService;
    @MockitoBean
    private StorageProvider storageProvider;
    private User adminUser;
    private User dietitianUser;
    private User regularUser;
    private BlogPost testPost;
    private String adminToken;
    private String dietitianToken;
    private String userToken;

    @BeforeEach
    void setUp() {
        adminUser = userRepository.save(
                UserTestUtils.createUserForPersistence("admin_blog", uniqueSuffix, Role.ADMIN, passwordEncoder));

        dietitianUser = userRepository.save(
                UserTestUtils.createUserForPersistence("dietitian", uniqueSuffix, Role.DIETITIAN, passwordEncoder));

        regularUser = userRepository.save(
                UserTestUtils.createUserForPersistence("user_blog", uniqueSuffix, Role.USER, passwordEncoder));

        testPost = blogPostRepository.save(BlogPost.builder()
                .title("Test Blog Post")
                .content("This is a test blog post content that is long enough to pass validation requirements.")
                .summary("Test summary")
                .author(dietitianUser)
                .build());

        adminToken = jwtService.generateToken(adminUser);
        dietitianToken = jwtService.generateToken(dietitianUser);
        userToken = jwtService.generateToken(regularUser);
    }

    @Nested
    @DisplayName("GET /blog")
    class GetAllPostsTests {

        @Test
        @DisplayName("getAllPosts_shouldReturnPaginatedPosts")
        void getAllPosts_shouldReturnPaginatedPosts() throws Exception {
            mockMvc.perform(get(BASE_URL)
                            .header("Authorization", "Bearer " + userToken)
                            .param("page", "0")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.content", isA(java.util.List.class)))
                    .andExpect(jsonPath("$.data.content[0].title", is("Test Blog Post")));
        }
    }

    @Nested
    @DisplayName("GET /blog/{id}")
    class GetPostByIdTests {

        @Test
        @DisplayName("getPostById_whenPostExists_shouldReturnPost")
        void getPostById_whenPostExists_shouldReturnPost() throws Exception {
            mockMvc.perform(get(BASE_URL + "/{id}", testPost.getId())
                            .header("Authorization", "Bearer " + userToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.id", is(testPost.getId().intValue())))
                    .andExpect(jsonPath("$.data.title", is("Test Blog Post")));
        }

        @Test
        @DisplayName("getPostById_whenPostNotFound_shouldReturnNotFound")
        void getPostById_whenPostNotFound_shouldReturnNotFound() throws Exception {
            mockMvc.perform(get(BASE_URL + "/{id}", 999999L)
                            .header("Authorization", "Bearer " + userToken))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("POST /blog")
    class CreatePostTests {

        @Test
        @DisplayName("createPost_whenAdmin_shouldReturnCreated")
        void createPost_whenAdmin_shouldReturnCreated() throws Exception {
            CreateBlogPostRequest request = new CreateBlogPostRequest();
            request.setTitle("New Admin Post");
            request.setContent("This is a new blog post content that is long enough to pass validation.");
            request.setSummary("New summary");

            mockMvc.perform(post(BASE_URL)
                            .header("Authorization", "Bearer " + adminToken)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.message", is("Post created")));
        }

        @Test
        @DisplayName("createPost_whenDietitian_shouldReturnCreated")
        void createPost_whenDietitian_shouldReturnCreated() throws Exception {
            CreateBlogPostRequest request = new CreateBlogPostRequest();
            request.setTitle("New Dietitian Post");
            request.setContent("This is a new blog post content that is long enough to pass validation.");
            request.setSummary("New summary");

            mockMvc.perform(post(BASE_URL)
                            .header("Authorization", "Bearer " + dietitianToken)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("createPost_whenUser_shouldReturnForbidden")
        void createPost_whenUser_shouldReturnForbidden() throws Exception {
            CreateBlogPostRequest request = new CreateBlogPostRequest();
            request.setTitle("New Post");
            request.setContent("This is a new blog post content that is long enough to pass validation.");
            request.setSummary("New summary");

            mockMvc.perform(post(BASE_URL)
                            .header("Authorization", "Bearer " + userToken)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("createPost_whenContentTooShort_shouldReturnBadRequest")
        void createPost_whenContentTooShort_shouldReturnBadRequest() throws Exception {
            CreateBlogPostRequest request = new CreateBlogPostRequest();
            request.setTitle("New Post");
            request.setContent("Short");
            request.setSummary("New summary");

            mockMvc.perform(post(BASE_URL)
                            .header("Authorization", "Bearer " + adminToken)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("PUT /blog/{id}")
    class UpdatePostTests {

        @Test
        @DisplayName("updatePost_whenAuthor_shouldReturnUpdatedPost")
        void updatePost_whenAuthor_shouldReturnUpdatedPost() throws Exception {
            CreateBlogPostRequest request = new CreateBlogPostRequest();
            request.setTitle("Updated Post Title");
            request.setContent("This is updated blog post content that is long enough to pass validation.");
            request.setSummary("Updated summary");

            mockMvc.perform(put(BASE_URL + "/{id}", testPost.getId())
                            .header("Authorization", "Bearer " + dietitianToken)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.title", is("Updated Post Title")));
        }

        @Test
        @DisplayName("updatePost_whenAdmin_shouldReturnUpdatedPost")
        void updatePost_whenAdmin_shouldReturnUpdatedPost() throws Exception {
            CreateBlogPostRequest request = new CreateBlogPostRequest();
            request.setTitle("Admin Updated Post");
            request.setContent("This is admin updated blog post content that is long enough to pass validation.");
            request.setSummary("Admin updated summary");

            mockMvc.perform(put(BASE_URL + "/{id}", testPost.getId())
                            .header("Authorization", "Bearer " + adminToken)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("DELETE /blog/{id}")
    class DeletePostTests {

        @Test
        @DisplayName("deletePost_whenAuthor_shouldReturnNoContent")
        void deletePost_whenAuthor_shouldReturnNoContent() throws Exception {
            mockMvc.perform(delete(BASE_URL + "/{id}", testPost.getId())
                            .header("Authorization", "Bearer " + dietitianToken)
                            .with(csrf()))
                    .andExpect(status().isNoContent());
        }

        @Test
        @DisplayName("deletePost_whenAdmin_shouldReturnNoContent")
        void deletePost_whenAdmin_shouldReturnNoContent() throws Exception {
            mockMvc.perform(delete(BASE_URL + "/{id}", testPost.getId())
                            .header("Authorization", "Bearer " + adminToken)
                            .with(csrf()))
                    .andExpect(status().isNoContent());
        }
    }

    @Nested
    @DisplayName("POST /blog/{id}/comments")
    class AddCommentTests {

        @Test
        @DisplayName("addComment_whenAuthenticated_shouldReturnCreated")
        void addComment_whenAuthenticated_shouldReturnCreated() throws Exception {
            CreateBlogCommentRequest request = new CreateBlogCommentRequest();
            request.setContent("This is a test comment");

            mockMvc.perform(post(BASE_URL + "/{id}/comments", testPost.getId())
                            .header("Authorization", "Bearer " + userToken)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.message", is("Comment added")));
        }

        @Test
        @DisplayName("addComment_whenNotAuthenticated_shouldReturnForbidden")
        void addComment_whenNotAuthenticated_shouldReturnForbidden() throws Exception {
            CreateBlogCommentRequest request = new CreateBlogCommentRequest();
            request.setContent("This is a test comment");

            mockMvc.perform(post(BASE_URL + "/{id}/comments", testPost.getId())
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isForbidden());
        }
    }
}
