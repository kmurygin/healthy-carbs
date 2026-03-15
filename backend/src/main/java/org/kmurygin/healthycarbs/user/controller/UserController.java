package org.kmurygin.healthycarbs.user.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.auth.service.AccessControlService;
import org.kmurygin.healthycarbs.user.dto.ChangePasswordRequest;
import org.kmurygin.healthycarbs.user.dto.CreateUserRequest;
import org.kmurygin.healthycarbs.user.dto.UpdateUserRequest;
import org.kmurygin.healthycarbs.user.dto.UserDTO;
import org.kmurygin.healthycarbs.user.mapper.UserMapper;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.service.UserPasswordService;
import org.kmurygin.healthycarbs.user.service.UserService;
import org.kmurygin.healthycarbs.util.ApiResponse;
import org.kmurygin.healthycarbs.util.ApiResponses;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@Validated
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final AccessControlService accessControlService;
    private final UserService userService;
    private final UserPasswordService userPasswordService;
    private final UserMapper userMapper;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(@PathVariable Long id) {
        accessControlService.assertOwnerOrAdmin(id, "user");
        return userService.getUserById(id)
                .map(user -> ApiResponses.success(userMapper.toDTO(user)))
                .orElse(ApiResponses.failure(HttpStatus.NOT_FOUND, "User not found"));
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<ApiResponse<UserDTO>> getUserByUsername(@PathVariable String username) {
        return userService.getUserByUsername(username)
                .map(user -> {
                    accessControlService.assertOwnerOrAdmin(user.getId(), "user");
                    return ApiResponses.success(userMapper.toDTO(user));
                })
                .orElse(ApiResponses.failure(HttpStatus.NOT_FOUND, "User not found"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDTO>> createUser(@Valid @RequestBody CreateUserRequest request) {
        User createdUser = userService.save(request);
        return ApiResponses.success(HttpStatus.CREATED,
                userMapper.toDTO(createdUser), "User created successfully");
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        accessControlService.assertOwnerOrAdmin(id, "user");
        UserDTO dto = userMapper.toDTO(userService.update(id, request));
        return ApiResponses.success(dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        accessControlService.assertOwnerOrAdmin(id, "user");
        userService.deleteUser(id);
        return ApiResponses.success(HttpStatus.NO_CONTENT, null, "User deleted");
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal User currentUser) {
        String username = currentUser.getUsername();
        userPasswordService.changePassword(username, request.getOldPassword(), request.getNewPassword());
        return ApiResponses.success(
                HttpStatus.OK, null, "Password has been changed successfully");
    }
}
