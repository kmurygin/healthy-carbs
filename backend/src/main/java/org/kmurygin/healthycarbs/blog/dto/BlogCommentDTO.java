package org.kmurygin.healthycarbs.blog.dto;

import lombok.Data;
import org.kmurygin.healthycarbs.user.dto.UserDTO;

import java.time.LocalDateTime;

@Data
public class BlogCommentDTO {
    private Long id;
    private String content;
    private UserDTO author;
    private LocalDateTime createdAt;
}
