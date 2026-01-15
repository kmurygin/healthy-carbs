package org.kmurygin.healthycarbs.blog.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateBlogCommentRequest {
    @Size(min = 12, message = "Content must be at least 12 characters")
    private String content;
}
