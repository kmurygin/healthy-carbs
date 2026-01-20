package org.kmurygin.healthycarbs.user;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collection;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertAll;

@DisplayName("User Entity Unit Tests")
class UserTest {

    private User user;

    @BeforeEach
    void setUp() {
        user = UserTestUtils.createTestUser();
    }

    @Nested
    @DisplayName("Field Accessors (Getters & Setters)")
    class AccessorTests {

        @Test
        @DisplayName("getters should return expected values")
        void getters_shouldReturnExpectedValues() {
            assertAll(
                    () -> assertThat(user.getId()).isEqualTo(1L),
                    () -> assertThat(user.getUsername()).isEqualTo("userUsername"),
                    () -> assertThat(user.getFirstName()).isEqualTo("userFirstName"),
                    () -> assertThat(user.getLastName()).isEqualTo("userLastName"),
                    () -> assertThat(user.getEmail()).isEqualTo("user@user.com"),
                    () -> assertThat(user.getPassword()).isEqualTo("encodedPassword"),
                    () -> assertThat(user.getRole()).isEqualTo(Role.USER)
            );
        }

        @Test
        @DisplayName("setters should update fields correctly")
        void setters_shouldUpdateFields() {
            User newUser = new User();
            newUser.setId(20L);
            newUser.setUsername("kacperkacper");
            newUser.setFirstName("Kacper");
            newUser.setLastName("Kacprowski");
            newUser.setEmail("kacper@kacprowski.pl");
            newUser.setPassword("hasloKacpra");
            newUser.setRole(Role.ADMIN);

            assertAll(
                    () -> assertThat(newUser.getId()).isEqualTo(20L),
                    () -> assertThat(newUser.getUsername()).isEqualTo("kacperkacper"),
                    () -> assertThat(newUser.getFirstName()).isEqualTo("Kacper"),
                    () -> assertThat(newUser.getLastName()).isEqualTo("Kacprowski"),
                    () -> assertThat(newUser.getEmail()).isEqualTo("kacper@kacprowski.pl"),
                    () -> assertThat(newUser.getPassword()).isEqualTo("hasloKacpra"),
                    () -> assertThat(newUser.getRole()).isEqualTo(Role.ADMIN)
            );
        }

        @Test
        @DisplayName("setUsername should affect UserDetails#getUsername")
        void setUsername_shouldReflectInUserDetails() {
            user.setUsername("kacper.kacprowski");
            assertThat(user.getUsername()).isEqualTo("kacper.kacprowski");
        }
    }


    @Nested
    @DisplayName("Constructors")
    class ConstructorTests {

        @Test
        @DisplayName("no arguments constructor should create object")
        void noArgsConstructor_shouldCreate() {
            User testUser = new User();
            assertThat(testUser).isNotNull();

            testUser.setId(12L);
            testUser.setUsername("Marian");
            testUser.setRole(Role.USER);

            assertAll(
                    () -> assertThat(testUser.getId()).isEqualTo(12L),
                    () -> assertThat(testUser.getUsername()).isEqualTo("Marian"),
                    () -> assertThat(testUser.getRole()).isEqualTo(Role.USER)
            );
        }

        @Test
        @DisplayName("all arguments constructor should create object and set all fields")
        void allArgsConstructor_shouldCreate() {
            User testUser = new User(
                    30L,
                    "jan.kowalski",
                    "Jan",
                    "Kowalski",
                    "jan@kowalski.com",
                    "Jankowalski22$",
                    Role.ADMIN,
                    new java.util.HashSet<>(),
                    null
            );

            assertAll(
                    () -> assertThat(testUser.getId()).isEqualTo(30L),
                    () -> assertThat(testUser.getUsername()).isEqualTo("jan.kowalski"),
                    () -> assertThat(testUser.getFirstName()).isEqualTo("Jan"),
                    () -> assertThat(testUser.getLastName()).isEqualTo("Kowalski"),
                    () -> assertThat(testUser.getEmail()).isEqualTo("jan@kowalski.com"),
                    () -> assertThat(testUser.getPassword()).isEqualTo("Jankowalski22$"),
                    () -> assertThat(testUser.getRole()).isEqualTo(Role.ADMIN)
            );
        }
    }


    @Nested
    @DisplayName("Builder")
    class BuilderTests {

        @Test
        @DisplayName("builder should build object")
        void builder_shouldBuild() {
            User testUser = User.builder()
                    .id(123L)
                    .username("anna.kowalska")
                    .firstName("Anna")
                    .lastName("Kowalska")
                    .email("anna.kowalska22@ania.com")
                    .password("helloThere2&&")
                    .role(Role.USER)
                    .build();

            assertAll(
                    () -> assertThat(testUser.getId()).isEqualTo(123L),
                    () -> assertThat(testUser.getUsername()).isEqualTo("anna.kowalska"),
                    () -> assertThat(testUser.getFirstName()).isEqualTo("Anna"),
                    () -> assertThat(testUser.getLastName()).isEqualTo("Kowalska"),
                    () -> assertThat(testUser.getEmail()).isEqualTo("anna.kowalska22@ania.com"),
                    () -> assertThat(testUser.getPassword()).isEqualTo("helloThere2&&"),
                    () -> assertThat(testUser.getRole()).isEqualTo(Role.USER)
            );
        }

        @Test
        @DisplayName("builder should build object with partial fields")
        void builder_shouldBuildWithPartialFields() {
            User testUser = User.builder()
                    .username("jan.kaczmarski")
                    .role(Role.USER)
                    .build();

            assertThat(testUser.getUsername()).isEqualTo("jan.kaczmarski");
            assertThat(testUser.getRole()).isEqualTo(Role.USER);
            assertThat(testUser.getId()).isNull();
            assertThat(testUser.getEmail()).isNull();
        }
    }


    @Nested
    @DisplayName("Equals")
    class EqualsAndHashCodeTests {

        @Test
        @DisplayName("equals should return false for different IDs")
        void equals_shouldReturnFalseForDifferentIds() {
            User userWithDifferentId = User.builder().id(2L).build();
            assertThat(user).isNotEqualTo(userWithDifferentId);
        }

        @Test
        @DisplayName("equals should return false when ID is null")
        void equals_shouldReturnFalseForNullId() {
            User userWithoutId = User.builder().build();
            assertThat(userWithoutId).isNotEqualTo(user);
            assertThat(userWithoutId.equals(User.builder().build())).isFalse();
        }

    }

    @Nested
    @DisplayName("HashCode")
    class HashCodeTests {
        @Test
        @DisplayName("hashCode should be consistent for same id")
        void hashCode_shouldBeConsistent() {
            User user1 = User.builder().id(1L).build();
            User user2 = User.builder().id(1L).build();
            assertThat(user1.hashCode()).isEqualTo(user2.hashCode());
        }
    }


    @Nested
    @DisplayName("ToString")
    class ToStringTests {

        @Test
        @DisplayName("toString should contain key fields without password")
        void toString_shouldNotContainPassword() {
            String text = user.toString();

            assertThat(text)
                    .contains("userUsername", "userFirstName", "userLastName", "user@user.com", "USER")
                    .doesNotContain("encodedPassword");
        }
    }


    @Nested
    @DisplayName("UserDetails Implementation")
    class UserDetailsTests {

        @Test
        @DisplayName("getAuthorities should return USER role")
        void getAuthorities_shouldReturnUserRole() {
            Collection<? extends GrantedAuthority> authorities = user.getAuthorities();

            assertThat(authorities)
                    .hasSize(1)
                    .first()
                    .isInstanceOf(SimpleGrantedAuthority.class)
                    .extracting(GrantedAuthority::getAuthority)
                    .isEqualTo("ROLE_USER");
        }

        @Test
        @DisplayName("getAuthorities should return ADMIN role")
        void getAuthorities_shouldReturnAdminRole() {
            user.setRole(Role.ADMIN);
            Collection<? extends GrantedAuthority> authorities = user.getAuthorities();

            assertThat(authorities)
                    .extracting(GrantedAuthority::getAuthority)
                    .containsExactly("ROLE_ADMIN");
        }

        @Test
        @DisplayName("boolean flags should return true")
        void Flags_shouldReturnTrue() {
            assertAll("UserDetails boolean flags",
                    () -> assertThat(user.isAccountNonExpired()).isTrue(),
                    () -> assertThat(user.isAccountNonLocked()).isTrue(),
                    () -> assertThat(user.isCredentialsNonExpired()).isTrue(),
                    () -> assertThat(user.isEnabled()).isTrue()
            );
        }

        @Test
        @DisplayName("getUsername should return username field value")
        void getUsername_shouldReturnUsername() {
            assertThat(user.getUsername()).isEqualTo("userUsername");
        }
    }


    @Nested
    @DisplayName("Defensive/negative checks")
    class DefensiveTests {

        @Test
        @DisplayName("getAuthorities should throw if role is null")
        void getAuthorities_shouldThrowWhenRoleNull() {
            User newUser = new User();
            newUser.setUsername("newUserWithoutRole");
            newUser.setRole(null);

            assertThatThrownBy(newUser::getAuthorities)
                    .isInstanceOf(NullPointerException.class);
        }
    }
}
