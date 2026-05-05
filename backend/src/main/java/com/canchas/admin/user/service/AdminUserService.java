package com.canchas.admin.user.service;

import com.canchas.admin.user.dto.AdminUserResponse;
import com.canchas.admin.user.dto.PatchAdminUserRequest;
import com.canchas.audit.service.AuditService;
import com.canchas.common.exception.NotFoundException;
import com.canchas.user.model.User;
import com.canchas.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
public class AdminUserService {

    private final UserRepository userRepository;
    private final AuditService auditService;

    public AdminUserService(UserRepository userRepository, AuditService auditService) {
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public Page<AdminUserResponse> list(String email, int page, int limit) {
        int size = Math.min(Math.max(limit, 1), 100);
        return userRepository.searchByEmailOptional(email, PageRequest.of(Math.max(page, 1) - 1, size, Sort.by("email")))
                .map(AdminUserResponse::from);
    }

    @Transactional
    public AdminUserResponse patch(User actor, UUID id, PatchAdminUserRequest body) {
        User u = userRepository.findById(id).orElseThrow(() -> new NotFoundException("usuario no encontrado"));
        Map<String, Object> before = Map.of("status", u.getStatus(), "role", u.getRole());
        if (body.status() != null) {
            u.setStatus(body.status());
        }
        if (body.role() != null) {
            u.setRole(body.role());
        }
        userRepository.save(u);
        auditService.record(actor, "USER_PATCH", "User", id.toString(), before, Map.of("status", u.getStatus(), "role", u.getRole()));
        return AdminUserResponse.from(u);
    }
}
