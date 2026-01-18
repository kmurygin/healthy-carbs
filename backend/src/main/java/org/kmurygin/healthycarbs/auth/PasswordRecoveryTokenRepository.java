package org.kmurygin.healthycarbs.auth;

import org.kmurygin.healthycarbs.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordRecoveryTokenRepository extends JpaRepository<PasswordRecoveryToken, Long> {
    Optional<PasswordRecoveryToken> findByUser(User user);

    void deleteByUser(User user);
}
