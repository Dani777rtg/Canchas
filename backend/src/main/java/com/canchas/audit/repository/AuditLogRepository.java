package com.canchas.audit.repository;

import com.canchas.audit.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    Page<AuditLog> findByEntityTypeIgnoreCaseAndEntityId(String entityType, String entityId, Pageable pageable);

    Page<AuditLog> findByEntityTypeIgnoreCase(String entityType, Pageable pageable);
}
