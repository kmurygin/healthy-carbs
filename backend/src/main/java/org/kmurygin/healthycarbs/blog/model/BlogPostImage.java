package org.kmurygin.healthycarbs.blog.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "blog_post_images")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlogPostImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String contentType;

    @Column(name = "image_url", length = 1024)
    private String imageUrl;

    @Column(name = "image_key", length = 1024)
    @JsonIgnore
    private String imageKey;

    @OneToOne(mappedBy = "image")
    @JsonIgnore
    private BlogPost post;
}
