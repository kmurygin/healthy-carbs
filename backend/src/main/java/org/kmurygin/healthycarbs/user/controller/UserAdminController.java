package org.kmurygin.healthycarbs.user.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.user.dto.ChangeRoleRequest;
import org.kmurygin.healthycarbs.user.dto.UserDTO;
import org.kmurygin.healthycarbs.user.mapper.UserMapper;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.service.UserAdminService;
import org.kmurygin.healthycarbs.user.service.UserService;
import org.kmurygin.healthycarbs.util.ApiResponse;
import org.kmurygin.healthycarbs.util.ApiResponses;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@Validated
@RestController
@RequestMapping("/api/v1/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserAdminController {

    private final UserAdminService userAdminService;
    private final UserService userService;
    private final UserMapper userMapper;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsers() {
        List<UserDTO> users = userAdminService.getAllUsers()
                .stream()
                .map(userMapper::toDTO)
                .toList();
        return ApiResponses.success(users);
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<ApiResponse<UserDTO>> changeUserRole(
            @PathVariable Long id,
            @Valid @RequestBody ChangeRoleRequest request) {
        User currentUser = userService.getCurrentUser();
        User updatedUser = userAdminService.changeUserRole(id, request.getRole(), currentUser);
        return ApiResponses.success(HttpStatus.OK, userMapper.toDTO(updatedUser), "User role updated successfully");
    }

    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<ApiResponse<UserDTO>> toggleUserActiveStatus(@PathVariable Long id) {
        User currentUser = userService.getCurrentUser();
        User updatedUser = userAdminService.toggleUserActiveStatus(id, currentUser);
        return ApiResponses.success(HttpStatus.OK, userMapper.toDTO(updatedUser), "User status updated successfully");
    }
}
