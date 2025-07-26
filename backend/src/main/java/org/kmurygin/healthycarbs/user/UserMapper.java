package org.kmurygin.healthycarbs.user;

import org.kmurygin.healthycarbs.user.dto.UserDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDTO toDTO(User user);

    User toEntity(UserDTO dto);
}
