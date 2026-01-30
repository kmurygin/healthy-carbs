package org.kmurygin.healthycarbs.user.service;

import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.storage.StorageProperties;
import org.kmurygin.healthycarbs.storage.StorageProvider;
import org.kmurygin.healthycarbs.storage.StorageUploadResult;
import org.kmurygin.healthycarbs.user.model.Role;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.model.UserProfileImage;
import org.kmurygin.healthycarbs.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class UserProfileImageService {

    private static final Logger logger = LoggerFactory.getLogger(UserProfileImageService.class);

    private final UserRepository userRepository;
    private final StorageProvider storageProvider;
    private final StorageProperties storageProperties;
    private final TransactionTemplate transactionTemplate;

    public void uploadProfileImage(Long userId, MultipartFile file, User currentUser) {
        validateProfileImageOwnership(userId, currentUser);
        User user = getUserOrThrow(userId);
        String oldImageKey = extractProfileImageKey(user);
        StorageUploadResult uploadResult = uploadNewProfileImage(userId, file);
        updateProfileImageInTransaction(userId, uploadResult);
        deleteOldProfileImage(oldImageKey);
    }

    @Transactional(readOnly = true)
    public UserProfileImage getProfileImageByUserId(Long userId) {
        User user = getUserOrThrow(userId);
        return user.getProfileImage();
    }

    public void deleteProfileImageByKey(String imageKey) {
        if (!StringUtils.hasText(imageKey)) {
            return;
        }
        try {
            storageProvider.deleteFileByKey(imageKey);
        } catch (Exception ex) {
            logger.error("Failed to delete profile image from storage: {}", imageKey, ex);
        }
    }

    private void validateProfileImageOwnership(Long userId, User currentUser) {
        if (currentUser == null) {
            throw new AccessDeniedException("You must be logged in to update profile image.");
        }
        if (!currentUser.getId().equals(userId) && currentUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("You can only update your own profile image.");
        }
    }

    private User getUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }

    private String extractProfileImageKey(User user) {
        return user.getProfileImage() != null
                ? user.getProfileImage().getImageKey()
                : null;
    }

    private StorageUploadResult uploadNewProfileImage(Long userId, MultipartFile file) {
        String folder = storageProperties.getUserProfileImagePrefix() + "/" + userId;
        return storageProvider.uploadFile(file, folder);
    }

    private void updateProfileImageInTransaction(Long userId, StorageUploadResult uploadResult) {
        transactionTemplate.executeWithoutResult(status -> {
            User userInTx = getUserOrThrow(userId);
            UserProfileImage image = UserProfileImage.builder()
                    .contentType(uploadResult.contentType())
                    .imageUrl(uploadResult.url())
                    .imageKey(uploadResult.key())
                    .build();
            userInTx.setProfileImage(image);
            userRepository.save(userInTx);
        });
    }

    private void deleteOldProfileImage(String oldImageKey) {
        if (!StringUtils.hasText(oldImageKey)) {
            return;
        }
        try {
            storageProvider.deleteFileByKey(oldImageKey);
        } catch (Exception ex) {
            logger.error("Failed to delete old profile image: {}", oldImageKey, ex);
        }
    }
}
