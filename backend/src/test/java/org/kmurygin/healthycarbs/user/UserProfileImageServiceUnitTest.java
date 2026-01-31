package org.kmurygin.healthycarbs.user;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.storage.StorageProperties;
import org.kmurygin.healthycarbs.storage.StorageProvider;
import org.kmurygin.healthycarbs.storage.StorageUploadResult;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.model.UserProfileImage;
import org.kmurygin.healthycarbs.user.repository.UserRepository;
import org.kmurygin.healthycarbs.user.service.UserProfileImageService;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserProfileImageService Unit Tests")
class UserProfileImageServiceUnitTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private StorageProvider storageProvider;

    @Mock
    private StorageProperties storageProperties;

    @Mock
    private TransactionTemplate transactionTemplate;

    private UserProfileImageService userProfileImageService;

    private User testUser;
    private User adminUser;

    @BeforeEach
    void setUp() {
        userProfileImageService = new UserProfileImageService(
                userRepository,
                storageProvider,
                storageProperties,
                transactionTemplate);

        testUser = UserTestUtils.createTestUser(1L, "testuser");

        adminUser = UserTestUtils.createAdmin();
        adminUser.setId(2L);
    }

    @Nested
    @DisplayName("getProfileImageByUserId")
    class GetProfileImageByUserIdTests {

        @Test
        @DisplayName("getProfileImageByUserId_whenUserHasImage_shouldReturnImage")
        void getProfileImageByUserId_whenUserHasImage_shouldReturnImage() {
            UserProfileImage profileImage = UserProfileImage.builder()
                    .imageKey("key")
                    .imageUrl("http://example.com/image.jpg")
                    .build();
            testUser.setProfileImage(profileImage);

            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

            UserProfileImage result = userProfileImageService.getProfileImageByUserId(1L);

            assertThat(result).isEqualTo(profileImage);
        }

        @Test
        @DisplayName("getProfileImageByUserId_whenUserHasNoImage_shouldReturnNull")
        void getProfileImageByUserId_whenUserHasNoImage_shouldReturnNull() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

            UserProfileImage result = userProfileImageService.getProfileImageByUserId(1L);

            assertThat(result).isNull();
        }

        @Test
        @DisplayName("getProfileImageByUserId_whenUserNotFound_shouldThrowResourceNotFound")
        void getProfileImageByUserId_whenUserNotFound_shouldThrowResourceNotFound() {
            when(userRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userProfileImageService.getProfileImageByUserId(999L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("deleteProfileImageByKey")
    class DeleteProfileImageByKeyTests {

        @Test
        @DisplayName("deleteProfileImageByKey_whenKeyProvided_shouldDeleteFromStorage")
        void deleteProfileImageByKey_whenKeyProvided_shouldDeleteFromStorage() {
            userProfileImageService.deleteProfileImageByKey("profile-images/1/image.jpg");

            verify(storageProvider).deleteFileByKey("profile-images/1/image.jpg");
        }

        @Test
        @DisplayName("deleteProfileImageByKey_whenKeyNull_shouldNotCallStorage")
        void deleteProfileImageByKey_whenKeyNull_shouldNotCallStorage() {
            userProfileImageService.deleteProfileImageByKey(null);

            verify(storageProvider, never()).deleteFileByKey(any());
        }

        @Test
        @DisplayName("deleteProfileImageByKey_whenKeyEmpty_shouldNotCallStorage")
        void deleteProfileImageByKey_whenKeyEmpty_shouldNotCallStorage() {
            userProfileImageService.deleteProfileImageByKey("");

            verify(storageProvider, never()).deleteFileByKey(any());
        }

        @Test
        @DisplayName("deleteProfileImageByKey_whenStorageThrows_shouldNotPropagateException")
        void deleteProfileImageByKey_whenStorageThrows_shouldNotPropagateException() {
            doThrow(new RuntimeException("Storage error"))
                    .when(storageProvider).deleteFileByKey("bad-key");

            userProfileImageService.deleteProfileImageByKey("bad-key");
        }
    }

    @Nested
    @DisplayName("uploadProfileImage validation")
    class UploadProfileImageValidationTests {

        @Test
        @DisplayName("uploadProfileImage_whenNotOwnerAndNotAdmin_shouldThrowAccessDenied")
        void uploadProfileImage_whenNotOwnerAndNotAdmin_shouldThrowAccessDenied() {
            User otherUser = UserTestUtils.createTestUser(3L, "other");
            MultipartFile file = mock(MultipartFile.class);

            assertThatThrownBy(() -> userProfileImageService.uploadProfileImage(1L, file, otherUser))
                    .isInstanceOf(AccessDeniedException.class)
                    .hasMessageContaining("can only update your own");
        }

        @Test
        @DisplayName("uploadProfileImage_whenNullUser_shouldThrowAccessDenied")
        void uploadProfileImage_whenNullUser_shouldThrowAccessDenied() {
            MultipartFile file = mock(MultipartFile.class);

            assertThatThrownBy(() -> userProfileImageService.uploadProfileImage(1L, file, null))
                    .isInstanceOf(AccessDeniedException.class)
                    .hasMessageContaining("must be logged in");
        }

        @Test
        @DisplayName("uploadProfileImage_whenOwner_shouldSucceed")
        void uploadProfileImage_whenOwner_shouldSucceed() {
            MultipartFile file = mock(MultipartFile.class);
            StorageUploadResult uploadResult = new StorageUploadResult(
                    "http://example.com/new-image.jpg",
                    "profile-images/1/new-image.jpg",
                    "image/jpeg");

            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
            when(storageProperties.getUserProfileImagePrefix()).thenReturn("profile-images");
            when(storageProvider.uploadFile(any(), any())).thenReturn(uploadResult);
            doAnswer(inv -> {
                java.util.function.Consumer<org.springframework.transaction.TransactionStatus> callback = inv
                        .getArgument(0);
                callback.accept(null);
                return null;
            }).when(transactionTemplate).executeWithoutResult(any());

            userProfileImageService.uploadProfileImage(1L, file, testUser);

            verify(storageProvider).uploadFile(eq(file), eq("profile-images/1"));
        }

        @Test
        @DisplayName("uploadProfileImage_whenAdmin_shouldSucceed")
        void uploadProfileImage_whenAdmin_shouldSucceed() {
            MultipartFile file = mock(MultipartFile.class);
            StorageUploadResult uploadResult = new StorageUploadResult(
                    "http://example.com/new-image.jpg",
                    "profile-images/1/new-image.jpg",
                    "image/jpeg");

            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
            when(storageProperties.getUserProfileImagePrefix()).thenReturn("profile-images");
            when(storageProvider.uploadFile(any(), any())).thenReturn(uploadResult);
            doAnswer(inv -> {
                java.util.function.Consumer<org.springframework.transaction.TransactionStatus> callback = inv
                        .getArgument(0);
                callback.accept(null);
                return null;
            }).when(transactionTemplate).executeWithoutResult(any());

            userProfileImageService.uploadProfileImage(1L, file, adminUser);

            verify(storageProvider).uploadFile(eq(file), eq("profile-images/1"));
        }
    }
}
