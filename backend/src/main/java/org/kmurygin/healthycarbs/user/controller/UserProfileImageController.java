package org.kmurygin.healthycarbs.user.controller;

import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.model.UserProfileImage;
import org.kmurygin.healthycarbs.user.service.UserProfileImageService;
import org.kmurygin.healthycarbs.user.service.UserService;
import org.kmurygin.healthycarbs.util.ApiResponse;
import org.kmurygin.healthycarbs.util.ApiResponses;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

@RequiredArgsConstructor
@Validated
@RestController
@RequestMapping("/api/v1/users")
public class UserProfileImageController {

    private final UserProfileImageService profileImageService;
    private final UserService userService;

    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Void>> uploadProfileImage(
            @PathVariable Long id,
            @NotNull @RequestParam("file") MultipartFile file) {
        User currentUser = userService.getCurrentUser();
        profileImageService.uploadProfileImage(id, file, currentUser);
        return ApiResponses.success(
                HttpStatus.OK, null, "Profile image updated successfully");
    }

    @GetMapping("/{userId}/image")
    public ResponseEntity<Void> getProfileImage(@PathVariable Long userId) {
        UserProfileImage image = profileImageService.getProfileImageByUserId(userId);
        if (image == null || image.getImageUrl() == null || image.getImageUrl().isBlank()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.status(HttpStatus.FOUND)
                .location(UriComponentsBuilder.fromUriString(image.getImageUrl())
                        .build()
                        .encode()
                        .toUri())
                .build();
    }
}
