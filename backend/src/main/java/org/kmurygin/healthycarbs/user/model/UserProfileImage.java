package org.kmurygin.healthycarbs.user.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_profile_images")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String contentType;

    @Column(name = "image_url", length = 1024)
    private String imageUrl;

    @Column(name = "image_key", length = 1024)
    @JsonIgnore
    private String imageKey;

    @OneToOne(mappedBy = "profileImage")
    @JsonIgnore
    private User user;
}
