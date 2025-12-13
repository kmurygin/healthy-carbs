package org.kmurygin.healthycarbs.measurements.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.measurements.dto.MeasurementPayload;
import org.kmurygin.healthycarbs.measurements.dto.UserMeasurementDTO;
import org.kmurygin.healthycarbs.measurements.mapper.UserMeasurementMapper;
import org.kmurygin.healthycarbs.measurements.model.UserMeasurement;
import org.kmurygin.healthycarbs.measurements.service.UserMeasurementService;
import org.kmurygin.healthycarbs.util.ApiResponse;
import org.kmurygin.healthycarbs.util.ApiResponses;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/measurements")
@RequiredArgsConstructor
public class UserMeasurementController {

    private final UserMeasurementService userMeasurementService;
    private final UserMeasurementMapper userMeasurementMapper;

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> addMeasurement(
            @Valid @RequestBody MeasurementPayload inputMeasurement
    ) {
        UserMeasurement newMeasurement = userMeasurementMapper.toEntity(inputMeasurement);
        userMeasurementService.addMeasurement(newMeasurement);
        return ApiResponses.success(HttpStatus.CREATED, null, "Measurement added successfully");
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserMeasurementDTO>>> getAllHistory() {
        List<UserMeasurement> measurementsHistory = userMeasurementService.findAll();
        List<UserMeasurementDTO> dtos = measurementsHistory.stream()
                .map(userMeasurementMapper::toDTO)
                .toList();

        return ApiResponses.success(dtos);
    }
}
