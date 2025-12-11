package org.kmurygin.healthycarbs.measurements.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record MeasurementPayload(
        @NotNull @Positive Double weight,
        @Positive Double waistCircumference,
        @Positive Double hipCircumference,
        @Positive Double chestCircumference,
        @Positive Double armCircumference,
        @Positive Double thighCircumference,
        @Positive Double calfCircumference
) {
}
