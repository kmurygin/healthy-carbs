package org.kmurygin.healthycarbs.measurements.dto;

import java.time.LocalDateTime;

public record UserMeasurementDTO(
        LocalDateTime date,
        Double weight,
        Double waistCircumference,
        Double hipCircumference,
        Double chestCircumference,
        Double armCircumference,
        Double thighCircumference,
        Double calfCircumference
) {
}
