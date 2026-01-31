package org.kmurygin.healthycarbs.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.kmurygin.healthycarbs.auth.model.PasswordRecoveryToken;
import org.kmurygin.healthycarbs.auth.repository.PasswordRecoveryTokenRepository;
import org.kmurygin.healthycarbs.user.model.Role;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@DisplayName("PasswordRecoveryTokenRepository Integration Tests")
class PasswordRecoveryTokenRepositoryTest {

    @Autowired
    private PasswordRecoveryTokenRepository tokenRepository;

    @Autowired
    private UserRepository userRepository;

    private User savedUser;

    @BeforeEach
    void setUp() {
        tokenRepository.deleteAll();
        userRepository.deleteAll();

        savedUser = userRepository.save(User.builder()
                .username("testuser_" + System.currentTimeMillis())
                .firstName("Test")
                .lastName("User")
                .email("test_" + System.currentTimeMillis() + "@example.com")
                .password("encodedPassword")
                .role(Role.USER)
                .isActive(true)
                .build());
    }

    @Nested
    @DisplayName("findByUser")
    class FindByUserTests {

        @Test
        @DisplayName("findByUser_whenTokenExists_shouldReturnToken")
        void findByUser_whenTokenExists_shouldReturnToken() {
            PasswordRecoveryToken token = tokenRepository.save(PasswordRecoveryToken.builder()
                    .user(savedUser)
                    .token("encodedOtp")
                    .expiryDate(Instant.now().plus(15, ChronoUnit.MINUTES))
                    .build());

            Optional<PasswordRecoveryToken> result = tokenRepository.findByUser(savedUser);

            assertThat(result).isPresent();
            assertThat(result.get().getId()).isEqualTo(token.getId());
            assertThat(result.get().getToken()).isEqualTo("encodedOtp");
        }

        @Test
        @DisplayName("findByUser_whenTokenNotExists_shouldReturnEmpty")
        void findByUser_whenTokenNotExists_shouldReturnEmpty() {
            Optional<PasswordRecoveryToken> result = tokenRepository.findByUser(savedUser);

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("findByUser_shouldReturnCorrectUserToken")
        void findByUser_shouldReturnCorrectUserToken() {
            User anotherUser = userRepository.save(User.builder()
                    .username("anotheruser_" + System.currentTimeMillis())
                    .email("another_" + System.currentTimeMillis() + "@example.com")
                    .password("encodedPassword")
                    .role(Role.USER)
                    .build());

            tokenRepository.save(PasswordRecoveryToken.builder()
                    .user(savedUser)
                    .token("firstToken")
                    .expiryDate(Instant.now().plus(15, ChronoUnit.MINUTES))
                    .build());

            tokenRepository.save(PasswordRecoveryToken.builder()
                    .user(anotherUser)
                    .token("secondToken")
                    .expiryDate(Instant.now().plus(15, ChronoUnit.MINUTES))
                    .build());

            Optional<PasswordRecoveryToken> result = tokenRepository.findByUser(savedUser);

            assertThat(result).isPresent();
            assertThat(result.get().getToken()).isEqualTo("firstToken");
        }
    }

    @Nested
    @DisplayName("deleteByUser")
    class DeleteByUserTests {

        @Test
        @DisplayName("deleteByUser_shouldRemoveToken")
        void deleteByUser_shouldRemoveToken() {
            tokenRepository.save(PasswordRecoveryToken.builder()
                    .user(savedUser)
                    .token("encodedOtp")
                    .expiryDate(Instant.now().plus(15, ChronoUnit.MINUTES))
                    .build());

            assertThat(tokenRepository.findByUser(savedUser)).isPresent();

            tokenRepository.deleteByUser(savedUser);

            assertThat(tokenRepository.findByUser(savedUser)).isEmpty();
        }

        @Test
        @DisplayName("deleteByUser_shouldNotAffectOtherUsers")
        void deleteByUser_shouldNotAffectOtherUsers() {
            User anotherUser = userRepository.save(User.builder()
                    .username("anotheruser_" + System.currentTimeMillis())
                    .email("another_" + System.currentTimeMillis() + "@example.com")
                    .password("encodedPassword")
                    .role(Role.USER)
                    .build());

            tokenRepository.save(PasswordRecoveryToken.builder()
                    .user(savedUser)
                    .token("firstToken")
                    .expiryDate(Instant.now().plus(15, ChronoUnit.MINUTES))
                    .build());

            tokenRepository.save(PasswordRecoveryToken.builder()
                    .user(anotherUser)
                    .token("secondToken")
                    .expiryDate(Instant.now().plus(15, ChronoUnit.MINUTES))
                    .build());

            tokenRepository.deleteByUser(savedUser);

            assertThat(tokenRepository.findByUser(savedUser)).isEmpty();
            assertThat(tokenRepository.findByUser(anotherUser)).isPresent();
        }
    }

    @Nested
    @DisplayName("CRUD operations")
    class CrudOperationsTests {

        @Test
        @DisplayName("save_shouldPersistToken")
        void save_shouldPersistToken() {
            Instant expiryDate = Instant.now().plus(15, ChronoUnit.MINUTES);

            PasswordRecoveryToken token = tokenRepository.save(PasswordRecoveryToken.builder()
                    .user(savedUser)
                    .token("encodedOtp")
                    .expiryDate(expiryDate)
                    .build());

            assertThat(token.getId()).isNotNull();
            assertThat(tokenRepository.findById(token.getId())).isPresent();
        }

        @Test
        @DisplayName("save_shouldUpdateExistingToken")
        void save_shouldUpdateExistingToken() {
            PasswordRecoveryToken token = tokenRepository.save(PasswordRecoveryToken.builder()
                    .user(savedUser)
                    .token("oldToken")
                    .expiryDate(Instant.now().plus(15, ChronoUnit.MINUTES))
                    .build());

            token.setToken("newToken");
            token.setExpiryDate(Instant.now().plus(30, ChronoUnit.MINUTES));
            tokenRepository.save(token);

            Optional<PasswordRecoveryToken> updated = tokenRepository.findById(token.getId());
            assertThat(updated).isPresent();
            assertThat(updated.get().getToken()).isEqualTo("newToken");
        }

        @Test
        @DisplayName("delete_shouldRemoveToken")
        void delete_shouldRemoveToken() {
            PasswordRecoveryToken token = tokenRepository.save(PasswordRecoveryToken.builder()
                    .user(savedUser)
                    .token("encodedOtp")
                    .expiryDate(Instant.now().plus(15, ChronoUnit.MINUTES))
                    .build());

            Long tokenId = token.getId();
            tokenRepository.delete(token);

            assertThat(tokenRepository.findById(tokenId)).isEmpty();
        }
    }
}
