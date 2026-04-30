package com.canchas.auth.dto;

import com.canchas.user.model.UserRole;
import com.canchas.user.model.UserStatus;

import java.util.UUID;

public record UserResponse(
        UUID id,
        String email,
        String fullName,
        String phone,
        UserRole role,
        UserStatus status
) {
}
