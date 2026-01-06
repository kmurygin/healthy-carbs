package org.kmurygin.healthycarbs.blog.service;

import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.blog.model.BlogComment;
import org.kmurygin.healthycarbs.blog.model.BlogPost;
import org.kmurygin.healthycarbs.blog.model.BlogPostImage;
import org.kmurygin.healthycarbs.blog.repository.BlogCommentRepository;
import org.kmurygin.healthycarbs.blog.repository.BlogPostImageRepository;
import org.kmurygin.healthycarbs.blog.repository.BlogPostRepository;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.user.Role;
import org.kmurygin.healthycarbs.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BlogService {

    private final BlogPostRepository blogPostRepository;
    private final BlogCommentRepository blogCommentRepository;
    private final BlogPostImageRepository blogPostImageRepository;

    public Page<BlogPost> findAllPosts(Pageable pageable) {
        return blogPostRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    public BlogPost findPostById(Long id) {
        return blogPostRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blog post not found with id: " + id));
    }

    @Transactional
    public BlogPost createPost(BlogPost post, User author) {
        post.setAuthor(author);
        return blogPostRepository.save(post);
    }

    @Transactional
    public void deletePost(Long id) {
        BlogPost post = blogPostRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blog post not found with id: " + id));

        blogPostRepository.delete(post);
    }

    @Transactional
    public BlogPost updatePost(Long id, BlogPost postDetails, User currentUser) {
        BlogPost post = findPostById(id);

        post.setTitle(postDetails.getTitle());
        post.setSummary(postDetails.getSummary());
        post.setContent(postDetails.getContent());

        return blogPostRepository.save(post);
    }

    @Transactional
    public BlogComment addComment(Long postId, String content, User author) {
        BlogPost post = findPostById(postId);
        BlogComment comment = BlogComment.builder()
                .content(content)
                .post(post)
                .author(author)
                .build();
        return blogCommentRepository.save(comment);
    }

    @Transactional
    public void deleteComment(Long commentId, User currentUser) {
        BlogComment comment = blogCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        boolean isCommentAuthor = comment.getAuthor().getId().equals(currentUser.getId());
        boolean isPostAuthor = comment.getPost().getAuthor().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;

        if (!isCommentAuthor && !isPostAuthor && !isAdmin) {
            throw new AccessDeniedException("You are not authorized to delete this comment.");
        }

        blogCommentRepository.delete(comment);
    }

    @Transactional
    public void uploadPostImage(Long postId, MultipartFile file) throws IOException {
        BlogPost post = findPostById(postId);

        BlogPostImage image = BlogPostImage.builder()
                .contentType(file.getContentType())
                .imageData(file.getBytes())
                .build();

        post.setImage(image);
        blogPostRepository.save(post);
    }

    @Transactional
    public BlogPostImage getPostImageById(Long imageId) {
        return blogPostImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Image", "id", imageId));
    }

}