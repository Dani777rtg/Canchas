package com.canchas.admin.audit.service;

import com.canchas.admin.audit.dto.AuditLogResponse;
import com.canchas.audit.model.AuditLog;
import com.canchas.audit.repository.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminAuditService {

    private final AuditLogRepository auditLogRepository;

    public AdminAuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional(readOnly = true)
    public Page<AuditLogResponse> list(String entityType, String entityId, int page, int limit) {
        int size = Math.min(Math.max(limit, 1), 100);
        var pageable = PageRequest.of(Math.max(page, 1) - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<AuditLog> raw;
        if (entityType != null && !entityType.isBlank() && entityId != null && !entityId.isBlank()) {
            raw = auditLogRepository.findByEntityTypeIgnoreCaseAndEntityId(entityType.trim(), entityId.trim(), pageable);
        } else if (entityType != null && !entityType.isBlank()) {
            raw = auditLogRepository.findByEntityTypeIgnoreCase(entityType.trim(), pageable);
        } else {
            raw = auditLogRepository.findAll(pageable);
        }
        return raw.map(AuditLogResponse::from);
    }
}
