package org.kmurygin.healthycarbs.user.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kmurygin.healthycarbs.exception.InvalidOldPasswordException;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserPasswordService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void changePassword(String username, String oldPassword, String newPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new InvalidOldPasswordException("");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("User {} changed password", username);
    }
}
