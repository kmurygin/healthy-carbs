package org.kmurygin.healthycarbs.user;

import org.kmurygin.healthycarbs.user.model.Role;
import org.kmurygin.healthycarbs.user.model.User;
import org.springframework.security.crypto.password.PasswordEncoder;

public class UserTestUtils {

    private static final String DEFAULT_PASSWORD = "Password12345!";

    public static User createTestUser() {
        return createTestUser(1L, "userUsername", Role.USER);
    }

    public static User createTestUser(Long id, String username) {
        return createTestUser(id, username, Role.USER);
    }

    public static User createAdmin() {
        return createTestUser(1L, "admin", Role.ADMIN);
    }

    public static User createTestUser(Long id, String username, Role role) {
        return User.builder()
                .id(id)
                .username(username)
                .firstName("Test")
                .lastName("User")
                .email(username + "@example.com")
                .password("encodedPassword")
                .role(role)
                .isActive(true)
                .build();
    }

    public static User createUserForPersistence(String uniqueSuffix, Role role, PasswordEncoder passwordEncoder) {
        String prefix = role.name().toLowerCase();
        return User.builder()
                .username(prefix + "_" + uniqueSuffix)
                .firstName(capitalize(prefix))
                .lastName("User")
                .email(prefix + "_" + uniqueSuffix + "@example.com")
                .password(passwordEncoder.encode(DEFAULT_PASSWORD))
                .role(role)
                .isActive(true)
                .build();
    }

    public static User createUserForPersistence(String username, String uniqueSuffix, Role role, PasswordEncoder passwordEncoder) {
        return User.builder()
                .username(username + "_" + uniqueSuffix)
                .firstName(capitalize(username))
                .lastName("User")
                .email(username + "_" + uniqueSuffix + "@example.com")
                .password(passwordEncoder.encode(DEFAULT_PASSWORD))
                .role(role)
                .isActive(true)
                .build();
    }

    public static User createAdminForPersistence(String uniqueSuffix, PasswordEncoder passwordEncoder) {
        return createUserForPersistence(uniqueSuffix, Role.ADMIN, passwordEncoder);
    }

    public static User createDietitianForPersistence(String uniqueSuffix, PasswordEncoder passwordEncoder) {
        return createUserForPersistence(uniqueSuffix, Role.DIETITIAN, passwordEncoder);
    }

    public static User createRegularUserForPersistence(String uniqueSuffix, PasswordEncoder passwordEncoder) {
        return createUserForPersistence(uniqueSuffix, Role.USER, passwordEncoder);
    }

    public static User createUserForPersistence(String uniqueSuffix, Role role) {
        String prefix = role.name().toLowerCase();
        return User.builder()
                .username(prefix + "_" + uniqueSuffix)
                .firstName(capitalize(prefix))
                .lastName("User")
                .email(prefix + "_" + uniqueSuffix + "@example.com")
                .password("encodedPassword")
                .role(role)
                .isActive(true)
                .build();
    }

    public static User createAdminForPersistence(String uniqueSuffix) {
        return createUserForPersistence(uniqueSuffix, Role.ADMIN);
    }

    public static User createDietitianForPersistence(String uniqueSuffix) {
        return createUserForPersistence(uniqueSuffix, Role.DIETITIAN);
    }

    public static User createRegularUserForPersistence(String uniqueSuffix) {
        return createUserForPersistence(uniqueSuffix, Role.USER);
    }

    public static String getDefaultPassword() {
        return DEFAULT_PASSWORD;
    }

    private static String capitalize(String str) {
        if (str == null || str.isEmpty()) return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
    }
}
