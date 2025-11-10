package org.kmurygin.healthycarbs.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    @Query("""
               SELECT r.id
               FROM User u
               JOIN u.favouriteRecipes r
               WHERE u.id = :userId
            """)
    Set<Long> findFavouriteRecipeIdsByUserId(@Param("userId") Long userId);
}
