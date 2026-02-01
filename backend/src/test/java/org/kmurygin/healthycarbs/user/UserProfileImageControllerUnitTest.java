package org.kmurygin.healthycarbs.user;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.kmurygin.healthycarbs.user.controller.UserProfileImageController;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.model.UserProfileImage;
import org.kmurygin.healthycarbs.user.service.UserProfileImageService;
import org.kmurygin.healthycarbs.user.service.UserService;
import org.kmurygin.healthycarbs.util.ApiResponse;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserProfileImageController Unit Tests")
class UserProfileImageControllerUnitTest {

    @Mock
    private UserProfileImageService profileImageService;

    @Mock
    private UserService userService;

    @InjectMocks
    private UserProfileImageController controller;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = UserTestUtils.createTestUser(1L, "testuser");
    }

    @Nested
    @DisplayName("uploadProfileImage")
    class UploadProfileImageTests {

        @Test
        @DisplayName("uploadProfileImage_shouldReturnOk")
        void uploadProfileImage_shouldReturnOk() {
            MultipartFile file = mock(MultipartFile.class);
            when(userService.getCurrentUser()).thenReturn(testUser);

            ResponseEntity<ApiResponse<Void>> response = controller.uploadProfileImage(1L, file);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            verify(profileImageService).uploadProfileImage(1L, file, testUser);
        }
    }

    @Nested
    @DisplayName("getProfileImage")
    class GetProfileImageTests {

        @Test
        @DisplayName("getProfileImage_whenImageExists_shouldReturnRedirect")
        void getProfileImage_whenImageExists_shouldReturnRedirect() {
            UserProfileImage image = UserProfileImage.builder()
                    .imageUrl("https://example.com/image.jpg")
                    .imageKey("profile-images/1/image.jpg")
                    .build();
            when(profileImageService.getProfileImageByUserId(1L)).thenReturn(image);

            ResponseEntity<Void> response = controller.getProfileImage(1L);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FOUND);
            assertThat(response.getHeaders().getLocation()).isNotNull();
            assertThat(response.getHeaders().getLocation().toString()).isEqualTo("https://example.com/image.jpg");
        }

        @Test
        @DisplayName("getProfileImage_whenImageIsNull_shouldReturnNotFound")
        void getProfileImage_whenImageIsNull_shouldReturnNotFound() {
            when(profileImageService.getProfileImageByUserId(1L)).thenReturn(null);

            ResponseEntity<Void> response = controller.getProfileImage(1L);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        }

        @Test
        @DisplayName("getProfileImage_whenImageUrlIsNull_shouldReturnNotFound")
        void getProfileImage_whenImageUrlIsNull_shouldReturnNotFound() {
            UserProfileImage image = UserProfileImage.builder()
                    .imageUrl(null)
                    .imageKey("key")
                    .build();
            when(profileImageService.getProfileImageByUserId(1L)).thenReturn(image);

            ResponseEntity<Void> response = controller.getProfileImage(1L);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        }

        @Test
        @DisplayName("getProfileImage_whenImageUrlIsBlank_shouldReturnNotFound")
        void getProfileImage_whenImageUrlIsBlank_shouldReturnNotFound() {
            UserProfileImage image = UserProfileImage.builder()
                    .imageUrl("")
                    .imageKey("key")
                    .build();
            when(profileImageService.getProfileImageByUserId(1L)).thenReturn(image);

            ResponseEntity<Void> response = controller.getProfileImage(1L);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        }
    }
}
