package org.kmurygin.healthycarbs.dietitian;

import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.dietitian.collaboration.CollaborationService;
import org.kmurygin.healthycarbs.exception.ForbiddenException;
import org.kmurygin.healthycarbs.mealplan.dto.DietaryProfileDTO;
import org.kmurygin.healthycarbs.mealplan.mapper.DietaryProfileMapper;
import org.kmurygin.healthycarbs.mealplan.model.DietaryProfile;
import org.kmurygin.healthycarbs.mealplan.service.DietaryProfileService;
import org.kmurygin.healthycarbs.measurements.dto.UserMeasurementDTO;
import org.kmurygin.healthycarbs.measurements.mapper.UserMeasurementMapper;
import org.kmurygin.healthycarbs.user.Role;
import org.kmurygin.healthycarbs.user.User;
import org.kmurygin.healthycarbs.user.UserMapper;
import org.kmurygin.healthycarbs.user.UserService;
import org.kmurygin.healthycarbs.user.dto.UserDTO;
import org.kmurygin.healthycarbs.util.ApiResponse;
import org.kmurygin.healthycarbs.util.ApiResponses;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dietitian")
@RequiredArgsConstructor
public class DietitianController {

    private final UserService userService;
    private final CollaborationService collaborationService;
    private final DietaryProfileService dietaryProfileService;
    private final UserMeasurementMapper measurementMapper;
    private final UserMapper userMapper;
    private final DietaryProfileMapper dietaryProfileMapper;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllDietitians() {
        List<UserDTO> dietitians = userService.findAllByRole(Role.DIETITIAN)
                .stream()
                .map(userMapper::toDTO)
                .toList();
        return ApiResponses.success(dietitians);
    }

    @PreAuthorize("hasAnyRole('DIETITIAN', 'ADMIN')")
    @GetMapping("/clients")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getMyClients() {
        User dietitian = userService.getCurrentUser();
        List<UserDTO> clients = collaborationService.getActiveClients(dietitian)
                .stream()
                .map(userMapper::toDTO)
                .toList();
        return ApiResponses.success(clients);
    }

    @PreAuthorize("hasAnyRole('DIETITIAN', 'ADMIN')")
    @GetMapping("/clients/{clientId}/measurements")
    public ResponseEntity<ApiResponse<List<UserMeasurementDTO>>> getClientMeasurements(
            @PathVariable Long clientId
    ) {
        User dietitian = userService.getCurrentUser();
        List<UserMeasurementDTO> measurements = collaborationService.getClientMeasurements(dietitian, clientId)
                .stream()
                .map(measurementMapper::toDTO)
                .toList();
        return ApiResponses.success(measurements);
    }

    @PreAuthorize("hasAnyRole('DIETITIAN', 'ADMIN')")
    @GetMapping("/clients/{clientId}/dietary-profile")
    public ResponseEntity<ApiResponse<DietaryProfileDTO>> getClientDietaryProfile(
            @PathVariable Long clientId
    ) {
        User dietitian = userService.getCurrentUser();

        boolean hasAccess = collaborationService.getActiveClients(dietitian).stream()
                .anyMatch(client -> client.getId().equals(clientId));

        if (!hasAccess) {
            throw new ForbiddenException("You do not have an active collaboration with this client.");
        }

        DietaryProfile profile = dietaryProfileService.getByUserId(clientId);
        return ApiResponses.success(dietaryProfileMapper.toDTO(profile));
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/collaboration/{dietitianId}")
    public ResponseEntity<ApiResponse<Boolean>> establishCollaboration(@PathVariable Long dietitianId) {
        User client = userService.getCurrentUser();
        collaborationService.establishCollaboration(dietitianId, client.getId());
        return ApiResponses.success(true);
    }
}