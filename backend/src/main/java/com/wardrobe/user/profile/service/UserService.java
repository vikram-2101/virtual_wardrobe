package com.wardrobe.user.profile.service;

import com.wardrobe.common.exception.ResourceNotFoundException;
import com.wardrobe.user.entity.User;
import com.wardrobe.user.entity.UserProfile;
import com.wardrobe.user.profile.dto.UpdateProfileRequest;
import com.wardrobe.user.profile.dto.UserProfileResponse;
import com.wardrobe.user.repository.UserProfileRepository;
import com.wardrobe.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserProfileRepository profileRepository;

    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        UserProfile profile = user.getProfile();
        return mapToResponse(user, profile);
    }

    @Transactional
    public UserProfileResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        UserProfile profile = user.getProfile();
        if (profile == null) {
            profile = UserProfile.builder()
                    .user(user)
                    .build();
            user.setProfile(profile);
        }

        if (request.getName() != null) {
            profile.setName(request.getName());
        }
        if (request.getHeight() != null) {
            profile.setHeight(request.getHeight());
        }
        if (request.getWeight() != null) {
            profile.setWeight(request.getWeight());
        }
        if (request.getGender() != null) {
            profile.setGender(request.getGender());
        }
        if (request.getStylePreferences() != null) {
            profile.setStylePreferences(request.getStylePreferences());
        }

        profile = profileRepository.save(profile);
        log.info("Updated profile for user id: {}", userId);

        return mapToResponse(user, profile);
    }

    private UserProfileResponse mapToResponse(User user, UserProfile profile) {
        return UserProfileResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .name(profile != null ? profile.getName() : null)
                .height(profile != null ? profile.getHeight() : null)
                .weight(profile != null ? profile.getWeight() : null)
                .gender(profile != null ? profile.getGender() : null)
                .stylePreferences(profile != null ? profile.getStylePreferences() : null)
                .createdAt(user.getCreatedAt())
                .updatedAt(profile != null ? profile.getUpdatedAt() : user.getUpdatedAt())
                .build();
    }
}
