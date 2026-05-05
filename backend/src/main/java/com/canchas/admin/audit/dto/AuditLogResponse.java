package com.canchas.admin.audit.dto;

import com.canchas.audit.model.AuditLog;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AuditLogResponse(
        UUID id,
        String actorEmail,
        String action,
        String entityType,
        String entityId,
        String beforeJson,
        String afterJson,
        OffsetDateTime createdAt
) {
    public static AuditLogResponse from(AuditLog a) {
        String actorEmail = a.getActor() != null ? a.getActor().getEmail() : null;
        return new AuditLogResponse(
                a.getId(),
                actorEmail,
                a.getAction(),
                a.getEntityType(),
                a.getEntityId(),
                a.getBeforeJson(),
                a.getAfterJson(),
                a.getCreatedAt()
        );
    }
}
