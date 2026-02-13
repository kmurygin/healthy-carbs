package org.kmurygin.healthycarbs.blog.mapper;

import org.kmurygin.healthycarbs.blog.dto.BlogCommentDTO;
import org.kmurygin.healthycarbs.blog.dto.BlogPostDTO;
import org.kmurygin.healthycarbs.blog.dto.CreateBlogPostRequest;
import org.kmurygin.healthycarbs.blog.model.BlogComment;
import org.kmurygin.healthycarbs.blog.model.BlogPost;
import org.kmurygin.healthycarbs.user.mapper.UserMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface BlogMapper {

    @Mapping(target = "imageId", source = "image.id")
    BlogPostDTO toPostDTO(BlogPost blogPost);

    @Mapping(target = "image", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    BlogPost toPostEntity(BlogPostDTO blogPostDTO);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "author", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "image", ignore = true)
    BlogPost toPostEntity(CreateBlogPostRequest request);

    BlogCommentDTO toCommentDTO(BlogComment blogComment);

    @Mapping(target = "post", ignore = true)
    @Mapping(target = "author", ignore = true)
    BlogComment toCommentEntity(BlogCommentDTO blogCommentDTO);
}
