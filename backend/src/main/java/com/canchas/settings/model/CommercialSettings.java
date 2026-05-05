package com.canchas.settings.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "commercial_settings")
public class CommercialSettings {

    @Id
    private UUID id;

    @Column(name = "iva_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal ivaPercent;

    @Column(name = "default_reservation_status", nullable = false, length = 30)
    private String defaultReservationStatus;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        this.id = this.id == null ? UUID.randomUUID() : this.id;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public BigDecimal getIvaPercent() {
        return ivaPercent;
    }

    public void setIvaPercent(BigDecimal ivaPercent) {
        this.ivaPercent = ivaPercent;
    }

    public String getDefaultReservationStatus() {
        return defaultReservationStatus;
    }

    public void setDefaultReservationStatus(String defaultReservationStatus) {
        this.defaultReservationStatus = defaultReservationStatus;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
}
