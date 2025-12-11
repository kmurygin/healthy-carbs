package org.kmurygin.healthycarbs.measurements.model;

import jakarta.persistence.*;
import lombok.*;
import org.kmurygin.healthycarbs.user.User;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user_measurements")
public class UserMeasurement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Double weight;

    private Double waistCircumference;
    private Double hipCircumference;
    private Double chestCircumference;
    private Double armCircumference;
    private Double thighCircumference;
    private Double calfCircumference;

    @Column(nullable = false)
    private LocalDateTime date;
}
