package org.kmurygin.healthycarbs.user.repository;

import org.kmurygin.healthycarbs.user.model.UserProfileImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserProfileImageRepository extends JpaRepository<UserProfileImage, Long> {
}
