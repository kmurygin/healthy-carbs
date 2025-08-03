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

@AllArgsConstructor
@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/v1/users")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;
    private final UserMapper userMapper;

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

    @GetMapping("username/{username}")
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
        boolean success = userService.changePassword(request.getOldPassword(), request.getNewPassword());
        if (success) {
            logger.info("Success!");
            return ApiResponses.success(HttpStatus.OK, null, "Password has been changed successfully");
        }
        logger.info("NOT Success!");
        return ApiResponses.failure(HttpStatus.BAD_REQUEST, "Old password is incorrect");
    }
}
