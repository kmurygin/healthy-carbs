package org.kmurygin.healthycarbs.auth.service;

import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.exception.ForbiddenException;
import org.kmurygin.healthycarbs.user.model.Role;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.service.UserService;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class AccessControlService {

    private final UserService userService;

    public void assertAuthorOrAdmin(User author, String resourceName) {
        assertAuthorOrAdmin(author, userService.getCurrentUser(), resourceName);
    }

    public void assertAuthorOrAdmin(User author, User currentUser, String resourceName) {
        if (currentUser.getRole() == Role.ADMIN) {
            return;
        }
        if (author == null || !author.getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You are not authorized to modify this " + resourceName + ".");
        }
    }

    public void assertOwnerOrAdmin(Long ownerId, String resourceName) {
        assertOwnerOrAdmin(ownerId, userService.getCurrentUser(), resourceName);
    }

    public void assertOwnerOrAdmin(Long ownerId, User currentUser, String resourceName) {
        if (currentUser.getRole() == Role.ADMIN) {
            return;
        }
        if (ownerId == null || !ownerId.equals(currentUser.getId())) {
            throw new ForbiddenException("You are not authorized to access this " + resourceName + ".");
        }
    }
}
