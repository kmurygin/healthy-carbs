package org.kmurygin.healthycarbs.dietitian.collaboration;

import org.kmurygin.healthycarbs.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CollaborationRepository extends JpaRepository<Collaboration, Long> {

    Optional<Collaboration> findByDietitianAndClientAndEndedAtIsNull(User dietitian, User client);

    boolean existsByDietitianAndClientAndEndedAtIsNull(User dietitian, User client);

    @Query("SELECT l.client FROM Collaboration l WHERE l.dietitian = :dietitian AND l.endedAt IS NULL")
    List<User> findActiveClientsByDietitian(User dietitian);

    boolean existsByDietitianIdAndClientIdAndEndedAtIsNull(Long dietitianId, Long clientId);

}