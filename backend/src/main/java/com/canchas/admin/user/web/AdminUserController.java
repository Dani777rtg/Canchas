package com.canchas.admin.user.web;

import com.canchas.admin.user.dto.AdminUserResponse;
import com.canchas.admin.user.dto.PatchAdminUserRequest;
import com.canchas.admin.user.service.AdminUserService;
import com.canchas.user.model.User;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/v1/admin/users")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping
    public Page<AdminUserResponse> list(
            @RequestParam(required = false) String email,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit
    ) {
        return adminUserService.list(email, page, limit);
    }

    @PatchMapping("/{id}")
    public AdminUserResponse patch(
            @AuthenticationPrincipal User actor,
            @PathVariable UUID id,
            @Valid @RequestBody PatchAdminUserRequest body
    ) {
        return adminUserService.patch(actor, id, body);
    }
}
