package org.kmurygin.healthycarbs.user;

import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.email.EmailDetails;
import org.kmurygin.healthycarbs.email.EmailService;
import org.kmurygin.healthycarbs.exception.InvalidOldPasswordException;
import org.kmurygin.healthycarbs.exception.ResourceAlreadyExistsException;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.storage.StorageProperties;
import org.kmurygin.healthycarbs.storage.StorageProvider;
import org.kmurygin.healthycarbs.storage.StorageUploadResult;
import org.kmurygin.healthycarbs.user.dto.CreateUserRequest;
import org.kmurygin.healthycarbs.user.dto.UpdateUserRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final StorageProvider storageProvider;
    private final StorageProperties storageProperties;
    private final TransactionTemplate transactionTemplate;

    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Transactional
    public User save(CreateUserRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new ResourceAlreadyExistsException("User", "username", request.getUsername());
        }

        String email = request.getEmail().toLowerCase();
        if (userRepository.findByEmail(email).isPresent()) {
            throw new ResourceAlreadyExistsException("User", "email", request.getEmail());
        }

        User user = User.builder()
                .username(request.getUsername())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.valueOf(request.getRole().toUpperCase()))
                .build();

        return userRepository.save(user);
    }

    @Transactional
    public User save(User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new ResourceAlreadyExistsException("User", "username", user.getUsername());
        }
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new ResourceAlreadyExistsException("User", "email", user.getEmail());
        }
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        String imageKey = user.getProfileImage() != null ? user.getProfileImage().getImageKey() : null;
        userRepository.delete(user);

        if (StringUtils.hasText(imageKey)) {
            try {
                storageProvider.deleteFileByKey(imageKey);
            } catch (Exception ex) {
                logger.error("Failed to delete user profile image from storage: {}", imageKey, ex);
            }
        }
    }

    @Transactional
    public User update(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());

        updateUserEmail(user, request.getEmail());

        return userRepository.save(user);
    }

    private void updateUserEmail(User user, String mail) {
        String newEmail = mail.toLowerCase();
        String oldEmail = user.getEmail();

        if (oldEmail.equalsIgnoreCase(newEmail)) {
            user.setEmail(newEmail);
            return;
        }

        if (userRepository.findByEmail(newEmail).isPresent()) {
            throw new ResourceAlreadyExistsException("User", "email", newEmail);
        }

        user.setEmail(newEmail);
        notifyEmailChange(user);
    }

    private void notifyEmailChange(User user) {
        String subject = "Change of email address";
        String body = String.format(
                "Your email has been changed to this one, %s!", user.getUsername()
        );

        emailService.sendMail(new EmailDetails(
                        user.getEmail(),
                        body,
                        subject
                )
        );
    }

    @Transactional
    public void changePassword(String oldPassword, String newPassword) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        User user = this.getUserByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new InvalidOldPasswordException("");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        logger.info("User {} changed password", username);
    }

    @Transactional(readOnly = true)
    public Set<Long> getFavouriteRecipesIds() {
        User user = getCurrentUser();
        return userRepository.findFavouriteRecipeIdsByUserId(user.getId());
    }

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof User user) {
            return user;
        }
        return null;
    }

    public List<User> findAllByRole(Role role) {
        return userRepository.findAllByRole(role);
    }

    public void uploadProfileImage(Long userId, MultipartFile file) {
        validateProfileImageOwnership(userId);
        User user = getUserOrThrow(userId);
        String oldImageKey = extractProfileImageKey(user);
        StorageUploadResult uploadResult = uploadNewProfileImage(userId, file);
        updateProfileImageInTransaction(userId, file, uploadResult);
        deleteOldProfileImage(oldImageKey);
    }

    private void validateProfileImageOwnership(Long userId) {
        User currentUser = getCurrentUser();
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

    private void updateProfileImageInTransaction(Long userId, MultipartFile file, StorageUploadResult uploadResult) {
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

    @Transactional(readOnly = true)
    public UserProfileImage getProfileImageByUserId(Long userId) {
        User user = getUserOrThrow(userId);
        return user.getProfileImage();
    }

}
