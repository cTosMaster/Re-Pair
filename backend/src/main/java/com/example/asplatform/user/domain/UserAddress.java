package com.example.asplatform.user.domain;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.locationtech.jts.geom.Point;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "user_addresses")
@Getter @Setter @NoArgsConstructor
public class UserAddress {

    /* PK = FK(users.id) */
    @Id
    private Long userId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)   // User ↔ Address 1:1
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length = 5)
    private String postalCode;

    @Column(nullable = false, length = 255)
    private String roadAddress;

    @Column(length = 255)
    private String detailAddress;

    @JdbcTypeCode(SqlTypes.GEOMETRY)
    @Column(columnDefinition = "POINT SRID 4326")
    private Point location;

    @Column(updatable = false)
    private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();

    private java.time.LocalDateTime updatedAt = java.time.LocalDateTime.now();

    @PreUpdate void touch() { this.updatedAt = java.time.LocalDateTime.now(); }
}
