package org.kmurygin.healthycarbs.dietitian.collaboration;

import jakarta.persistence.*;
import lombok.*;
import org.kmurygin.healthycarbs.user.model.User;

import java.time.OffsetDateTime;

@Entity
@Table(name = "collaborations")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Collaboration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "dietitian_id", nullable = false)
    private User dietitian;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "client_id", nullable = false)
    private User client;

    @Column(nullable = false)
    private OffsetDateTime startedAt;

    private OffsetDateTime endedAt;

    public boolean isActive() {
        return endedAt == null;
    }

    public void terminate() {
        this.endedAt = OffsetDateTime.now();
    }
}
