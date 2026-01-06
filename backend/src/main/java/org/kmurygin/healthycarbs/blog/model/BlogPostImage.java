package org.kmurygin.healthycarbs.blog.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

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

    @Lob
    @JdbcTypeCode(SqlTypes.BINARY)
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "image_data", nullable = false)
    @JsonIgnore
    private byte[] imageData;

    @OneToOne(mappedBy = "image")
    @JsonIgnore
    private BlogPost post;
}
