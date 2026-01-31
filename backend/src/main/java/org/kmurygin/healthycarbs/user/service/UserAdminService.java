package org.kmurygin.healthycarbs.user.service;

import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.user.model.Role;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserAdminService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<User> findAllByRole(Role role) {
        return userRepository.findAllByRole(role);
    }

    @Transactional
    public User changeUserRole(Long userId, Role newRole, User currentUser) {
        validateAdminAccess(currentUser);

        if (currentUser.getId().equals(userId)) {
            throw new IllegalArgumentException("You cannot change your own role.");
        }

        if (newRole == Role.ADMIN) {
            throw new IllegalArgumentException(
                    "Cannot assign ADMIN role. Only system administrators can create admins.");
        }

        User user = getUserOrThrow(userId);

        if (user.getRole() == Role.ADMIN) {
            throw new IllegalArgumentException("Cannot change role of an admin user.");
        }

        user.setRole(newRole);
        return userRepository.save(user);
    }

    @Transactional
    public User toggleUserActiveStatus(Long userId, User currentUser) {
        validateAdminAccess(currentUser);

        if (currentUser.getId().equals(userId)) {
            throw new IllegalArgumentException("You cannot deactivate your own account.");
        }

        User user = getUserOrThrow(userId);
        user.setIsActive(!Boolean.TRUE.equals(user.getIsActive()));
        return userRepository.save(user);
    }

    private void validateAdminAccess(User currentUser) {
        if (currentUser == null || currentUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only admins can perform this operation.");
        }
    }

    private User getUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }
}
