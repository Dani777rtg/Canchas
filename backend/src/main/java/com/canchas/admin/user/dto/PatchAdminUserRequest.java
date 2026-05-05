package com.canchas.admin.user.dto;

import com.canchas.user.model.UserRole;
import com.canchas.user.model.UserStatus;

public record PatchAdminUserRequest(
        UserStatus status,
        UserRole role
) {
}
