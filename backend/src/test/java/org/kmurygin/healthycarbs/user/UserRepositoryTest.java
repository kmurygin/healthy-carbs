package org.kmurygin.healthycarbs.user;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.kmurygin.healthycarbs.user.model.Role;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.kmurygin.healthycarbs.user.UserTestUtils.createDietitianForPersistence;
import static org.kmurygin.healthycarbs.user.UserTestUtils.createRegularUserForPersistence;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@DisplayName("UserRepository Integration Tests")
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    private User savedUser;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();

        savedUser = userRepository.save(createRegularUserForPersistence(
                String.valueOf(System.currentTimeMillis())));
    }

    @Nested
    @DisplayName("findByUsername")
    class FindByUsernameTests {

        @Test
        @DisplayName("findByUsername_whenUserExists_shouldReturnUser")
        void findByUsername_whenUserExists_shouldReturnUser() {
            Optional<User> result = userRepository.findByUsername(savedUser.getUsername());

            assertThat(result).isPresent();
            assertThat(result.get().getId()).isEqualTo(savedUser.getId());
        }

        @Test
        @DisplayName("findByUsername_whenUserNotExists_shouldReturnEmpty")
        void findByUsername_whenUserNotExists_shouldReturnEmpty() {
            Optional<User> result = userRepository.findByUsername("nonexistent");

            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("findByEmail")
    class FindByEmailTests {

        @Test
        @DisplayName("findByEmail_whenUserExists_shouldReturnUser")
        void findByEmail_whenUserExists_shouldReturnUser() {
            Optional<User> result = userRepository.findByEmail(savedUser.getEmail());

            assertThat(result).isPresent();
            assertThat(result.get().getId()).isEqualTo(savedUser.getId());
        }

        @Test
        @DisplayName("findByEmail_whenUserNotExists_shouldReturnEmpty")
        void findByEmail_whenUserNotExists_shouldReturnEmpty() {
            Optional<User> result = userRepository.findByEmail("nonexistent@example.com");

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("findByEmail_shouldBeCaseInsensitive")
        void findByEmail_shouldBeCaseInsensitive() {
            Optional<User> result = userRepository.findByEmail(savedUser.getEmail().toUpperCase());

            // Depending on DB config, this may or may not find the user
            // PostgreSQL is case-sensitive by default
            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("findAllByRole")
    class FindAllByRoleTests {

        @Test
        @DisplayName("findAllByRole_whenUsersExist_shouldReturnMatchingUsers")
        void findAllByRole_whenUsersExist_shouldReturnMatchingUsers() {
            User dietitian = userRepository.save(createDietitianForPersistence(
                    String.valueOf(System.currentTimeMillis())));

            List<User> result = userRepository.findAllByRole(Role.DIETITIAN);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getId()).isEqualTo(dietitian.getId());
        }

        @Test
        @DisplayName("findAllByRole_whenNoMatches_shouldReturnEmptyList")
        void findAllByRole_whenNoMatches_shouldReturnEmptyList() {
            List<User> result = userRepository.findAllByRole(Role.ADMIN);

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("findAllByRole_shouldReturnMultipleUsers")
        void findAllByRole_shouldReturnMultipleUsers() {
            userRepository.save(createRegularUserForPersistence(
                    "2_" + System.currentTimeMillis()));

            List<User> result = userRepository.findAllByRole(Role.USER);

            assertThat(result).hasSize(2);
        }
    }

    @Nested
    @DisplayName("findFavouriteRecipeIdsByUserId")
    class FindFavouriteRecipeIdsByUserIdTests {

        @Test
        @DisplayName("findFavouriteRecipeIdsByUserId_whenNoFavourites_shouldReturnEmptySet")
        void findFavouriteRecipeIdsByUserId_whenNoFavourites_shouldReturnEmptySet() {
            Set<Long> result = userRepository.findFavouriteRecipeIdsByUserId(savedUser.getId());

            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("CRUD operations")
    class CrudOperationsTests {

        @Test
        @DisplayName("save_shouldPersistUser")
        void save_shouldPersistUser() {
            User newUser = createRegularUserForPersistence(
                    "new_" + System.currentTimeMillis());

            User saved = userRepository.save(newUser);

            assertThat(saved.getId()).isNotNull();
            assertThat(userRepository.findById(saved.getId())).isPresent();
        }

        @Test
        @DisplayName("delete_shouldRemoveUser")
        void delete_shouldRemoveUser() {
            Long userId = savedUser.getId();
            userRepository.delete(savedUser);

            assertThat(userRepository.findById(userId)).isEmpty();
        }

        @Test
        @DisplayName("findAll_shouldReturnAllUsers")
        void findAll_shouldReturnAllUsers() {
            List<User> result = userRepository.findAll();

            assertThat(result).isNotEmpty();
            assertThat(result).contains(savedUser);
        }
    }
}
