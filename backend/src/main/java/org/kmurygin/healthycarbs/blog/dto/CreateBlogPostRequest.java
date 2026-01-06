package org.kmurygin.healthycarbs.blog.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateBlogPostRequest {
    private String title;

    @Size(min = 12, message = "Content must be at least 12 characters")
    private String content;
    private String summary;
}
