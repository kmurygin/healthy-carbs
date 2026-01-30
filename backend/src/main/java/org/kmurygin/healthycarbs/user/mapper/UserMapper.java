package org.kmurygin.healthycarbs.user.mapper;

import org.kmurygin.healthycarbs.user.dto.UserDTO;
import org.kmurygin.healthycarbs.user.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "profileImageId", source = "profileImage.id")
    UserDTO toDTO(User user);

    @Mapping(target = "profileImage", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "favouriteRecipes", ignore = true)
    User toEntity(UserDTO dto);
}
