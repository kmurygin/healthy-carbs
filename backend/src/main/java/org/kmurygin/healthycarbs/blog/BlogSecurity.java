package org.kmurygin.healthycarbs.blog;

import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.blog.model.BlogPost;
import org.kmurygin.healthycarbs.blog.service.BlogService;
import org.kmurygin.healthycarbs.user.Role;
import org.kmurygin.healthycarbs.user.User;
import org.springframework.stereotype.Component;

@Component("blogSecurity")
@RequiredArgsConstructor
public class BlogSecurity {

    private final BlogService blogService;

    public boolean hasEditPermissionsForPost(Long postId, User user) {
        BlogPost post = blogService.findPostById(postId);
        return post.getAuthor().getId().equals(user.getId()) || user.getRole() == Role.ADMIN;
    }
}
