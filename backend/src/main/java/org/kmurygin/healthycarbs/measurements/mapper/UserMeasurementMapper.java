package org.kmurygin.healthycarbs.measurements.mapper;

import org.kmurygin.healthycarbs.measurements.dto.MeasurementPayload;
import org.kmurygin.healthycarbs.measurements.dto.UserMeasurementDTO;
import org.kmurygin.healthycarbs.measurements.model.UserMeasurement;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMeasurementMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "date", ignore = true)
    UserMeasurement toEntity(MeasurementPayload input);

    UserMeasurementDTO toDTO(UserMeasurement entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "date", ignore = true)
    void updateEntity(@MappingTarget UserMeasurement target, UserMeasurement source);
}
