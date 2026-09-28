package com.wardrobe.user.auth.service;

import com.wardrobe.common.exception.BadRequestException;
import com.wardrobe.common.security.CustomUserDetails;
import com.wardrobe.common.security.JwtService;
import com.wardrobe.user.auth.dto.AuthResponse;
import com.wardrobe.user.auth.dto.GoogleAuthRequest;
import com.wardrobe.user.auth.dto.LoginRequest;
import com.wardrobe.user.auth.dto.RegisterRequest;
import com.wardrobe.user.entity.Role;
import com.wardrobe.user.entity.User;
import com.wardrobe.user.entity.UserProfile;
import com.wardrobe.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;

        @Transactional
        public AuthResponse register(RegisterRequest request) {
                if (userRepository.existsByEmail(request.getEmail().toLowerCase().trim())) {
                        throw new BadRequestException("User already exists with email: " + request.getEmail());
                }

                User user = User.builder()
                                .email(request.getEmail().toLowerCase().trim())
                                .passwordHash(passwordEncoder.encode(request.getPassword()))
                                .role(Role.ROLE_USER)
                                .enabled(true)
                                .build();

                UserProfile profile = UserProfile.builder()
                                .user(user)
                                .name(request.getName())
                                .height(request.getHeight())
                                .weight(request.getWeight())
                                .gender(request.getGender())
                                .build();

                user.setProfile(profile);
                User savedUser = userRepository.save(user);

                CustomUserDetails userDetails = new CustomUserDetails(savedUser);
                String token = jwtService.generateToken(userDetails, savedUser.getId());

                log.info("Registered new user with id: {}", savedUser.getId());

                return AuthResponse.builder()
                                .token(token)
                                .userId(savedUser.getId())
                                .email(savedUser.getEmail())
                                .name(profile.getName())
                                .build();
        }

        @Transactional(readOnly = true)
        public AuthResponse login(LoginRequest request) {
                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail().toLowerCase().trim(),
                                                request.getPassword()));

                CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
                User user = userDetails.getUser();

                String token = jwtService.generateToken(userDetails, user.getId());

                String name = user.getProfile() != null ? user.getProfile().getName() : null;

                log.info("User logged in with id: {}", user.getId());

                return AuthResponse.builder()
                                .token(token)
                                .userId(user.getId())
                                .email(user.getEmail())
                                .name(name)
                                .build();
        }

        @Transactional
        public AuthResponse loginWithGoogle(GoogleAuthRequest request) {
                String normalizedEmail = request.getEmail().toLowerCase().trim();

                User user = userRepository.findByEmail(normalizedEmail).orElseGet(() -> {
                        // Automatically provision user account on first Google Sign-In
                        User newUser = User.builder()
                                        .email(normalizedEmail)
                                        .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                                        .role(Role.ROLE_USER)
                                        .enabled(true)
                                        .build();

                        UserProfile profile = UserProfile.builder()
                                        .user(newUser)
                                        .name(request.getName())
                                        .build();

                        newUser.setProfile(profile);
                        User saved = userRepository.save(newUser);
                        log.info("Provisioned new Google user with id: {}", saved.getId());
                        return saved;
                });

                CustomUserDetails userDetails = new CustomUserDetails(user);
                String token = jwtService.generateToken(userDetails, user.getId());

                String name = user.getProfile() != null ? user.getProfile().getName() : request.getName();

                log.info("User authenticated via Google with id: {}", user.getId());

                return AuthResponse.builder()
                                .token(token)
                                .userId(user.getId())
                                .email(user.getEmail())
                                .name(name)
                                .build();
        }
}
