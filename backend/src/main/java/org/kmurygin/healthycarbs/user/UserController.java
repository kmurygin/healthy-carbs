package org.kmurygin.healthycarbs.user;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.kmurygin.healthycarbs.user.dto.CreateUserRequest;
import org.kmurygin.healthycarbs.user.dto.UpdateUserRequest;
import org.kmurygin.healthycarbs.user.dto.UserDTO;
import org.kmurygin.healthycarbs.util.ApiResponse;
import org.kmurygin.healthycarbs.util.ApiResponses;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/user")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;
    private final UserMapper userMapper;

    public UserController(UserService userService, UserMapper userMapper) {
        this.userService = userService;
        this.userMapper = userMapper;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsers() {
        List<UserDTO> users = userService.getAllUsers()
                .stream()
                .map(userMapper::toDTO)
                .toList();
        return ApiResponses.success(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(@PathVariable Integer id) {
        return userService.getUserById(id)
                .map(user -> ApiResponses.success(userMapper.toDTO(user)))
                .orElse(ApiResponses.failure(HttpStatus.NOT_FOUND, "User not found"));
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<ApiResponse<UserDTO>> getUserByUsername(@PathVariable String username) {
        return userService.getUserByUsername(username)
                .map(user -> ApiResponses.success(userMapper.toDTO(user)))
                .orElse(ApiResponses.failure(HttpStatus.NOT_FOUND, "User not found"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserDTO>> createUser(@Valid @RequestBody CreateUserRequest request) {
        User createdUser = userService.save(request);
        return ApiResponses.success(HttpStatus.CREATED,
                userMapper.toDTO(createdUser), "User created successfully");
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> updateUser(@PathVariable Integer id, @Valid @RequestBody UpdateUserRequest request) {
        UserDTO dto = userMapper.toDTO(userService.update(id, request));
        return ApiResponses.success(dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
        return ApiResponses.success(HttpStatus.NO_CONTENT, null, "User deleted");
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(request.getOldPassword(), request.getNewPassword());
        return ApiResponses.success(HttpStatus.OK, null, "Password has been changed successfully");
    }
}
