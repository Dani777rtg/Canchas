package com.canchas.admin.user.dto;

import com.canchas.user.model.User;
import com.canchas.user.model.UserRole;
import com.canchas.user.model.UserStatus;

import java.util.UUID;

public record AdminUserResponse(
        UUID id,
        String email,
        String fullName,
        String phone,
        UserRole role,
        UserStatus status
) {
    public static AdminUserResponse from(User u) {
        return new AdminUserResponse(
                u.getId(),
                u.getEmail(),
                u.getFullName(),
                u.getPhone(),
                u.getRole(),
                u.getStatus()
        );
    }
}
