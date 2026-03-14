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
        User currentUser = userService.getCurrentUser();
        if (author == null || (!author.getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ADMIN)) {
            throw new ForbiddenException("You are not authorized to modify this " + resourceName + ".");
        }
    }

    public void assertOwnerOrAdmin(Long ownerId, String resourceName) {
        User currentUser = userService.getCurrentUser();
        if (ownerId == null || (!ownerId.equals(currentUser.getId()) && currentUser.getRole() != Role.ADMIN)) {
            throw new ForbiddenException("You are not authorized to access this " + resourceName + ".");
        }
    }
}
