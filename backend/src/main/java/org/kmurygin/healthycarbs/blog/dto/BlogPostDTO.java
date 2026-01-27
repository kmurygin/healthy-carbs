package org.kmurygin.healthycarbs.blog.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;
import org.kmurygin.healthycarbs.user.dto.UserDTO;

import java.time.Instant;
import java.util.List;

@Data
public class BlogPostDTO {
    private Long id;
    private String title;

    @Size(min = 12, message = "Content must be at least 12 characters")
    private String content;
    private String summary;
    private UserDTO author;
    private Instant createdAt;
    private List<BlogCommentDTO> comments;
    private Long imageId;
}