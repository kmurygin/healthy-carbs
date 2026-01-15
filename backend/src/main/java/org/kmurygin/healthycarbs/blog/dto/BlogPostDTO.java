package org.kmurygin.healthycarbs.blog.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;
import org.kmurygin.healthycarbs.user.dto.UserDTO;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class BlogPostDTO {
    private Long id;
    private String title;

    @Size(min = 12, message = "Content must be at least 12 characters")
    private String content;
    private String summary;
    private UserDTO author;
    private LocalDateTime createdAt;
    private List<BlogCommentDTO> comments;
    private Long imageId;
}