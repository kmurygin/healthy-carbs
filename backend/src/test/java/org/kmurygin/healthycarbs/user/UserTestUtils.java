package org.kmurygin.healthycarbs.user;

public class UserTestUtils {
    public static User createTestUser() {
        return User.builder()
                .id(1L)
                .username("userUsername")
                .firstName("userFirstName")
                .lastName("userLastName")
                .email("user@user.com")
                .password("encodedPassword")
                .role(Role.USER)
                .build();
    }
}
