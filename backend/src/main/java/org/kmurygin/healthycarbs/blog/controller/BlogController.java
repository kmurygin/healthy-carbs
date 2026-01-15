package org.kmurygin.healthycarbs.blog.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kmurygin.healthycarbs.auth.AuthenticationService;
import org.kmurygin.healthycarbs.blog.dto.BlogCommentDTO;
import org.kmurygin.healthycarbs.blog.dto.BlogPostDTO;
import org.kmurygin.healthycarbs.blog.dto.CreateBlogCommentRequest;
import org.kmurygin.healthycarbs.blog.dto.CreateBlogPostRequest;
import org.kmurygin.healthycarbs.blog.mapper.BlogMapper;
import org.kmurygin.healthycarbs.blog.model.BlogComment;
import org.kmurygin.healthycarbs.blog.model.BlogPost;
import org.kmurygin.healthycarbs.blog.model.BlogPostImage;
import org.kmurygin.healthycarbs.blog.service.BlogService;
import org.kmurygin.healthycarbs.util.ApiResponse;
import org.kmurygin.healthycarbs.util.ApiResponses;
import org.kmurygin.healthycarbs.util.PaginatedResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

@Slf4j
@RestController
@RequestMapping("/api/v1/blog")
@RequiredArgsConstructor
public class BlogController {

    private final BlogService blogService;
    private final BlogMapper blogMapper;
    private final AuthenticationService authenticationService;

    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponse<BlogPostDTO>>> getAllPosts(
            Pageable pageable
    ) {
        log.info("Received pageable: {}", pageable);
        Page<BlogPost> page = blogService.findAllPosts(pageable);
        Page<BlogPostDTO> dtoPage = page.map(blogMapper::toPostDTO);

        PaginatedResponse<BlogPostDTO> response = new PaginatedResponse<>(
                dtoPage.getContent(),
                dtoPage.getTotalPages(),
                dtoPage.getTotalElements(),
                dtoPage.getSize(),
                dtoPage.getNumber(),
                dtoPage.isFirst(),
                dtoPage.isLast(),
                dtoPage.isEmpty()
        );

        return ApiResponses.success(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BlogPostDTO>> getPostById(@PathVariable Long id) {
        return ApiResponses.success(blogMapper.toPostDTO(blogService.findPostById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DIETITIAN')")
    public ResponseEntity<ApiResponse<BlogPostDTO>> createPost(
            @RequestBody @Valid CreateBlogPostRequest request
    ) {
        BlogPost post = blogMapper.toPostEntity(request);
        log.info("Received post: {}", request);
        log.info("Mapped post: {}", post);
        BlogPost created = blogService.createPost(post, authenticationService.getCurrentUser());
        return ApiResponses.success(
                HttpStatus.CREATED, blogMapper.toPostDTO(created), "Post created"
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@blogSecurity.hasEditPermissionsForPost(#id, principal)")
    public ResponseEntity<ApiResponse<Void>> deletePost(@PathVariable Long id) {
        blogService.deletePost(id);
        return ApiResponses.success(HttpStatus.NO_CONTENT, null, "Post deleted");
    }

    @PutMapping("/{id}")
    @PreAuthorize("@blogSecurity.hasEditPermissionsForPost(#id, principal)")
    public ResponseEntity<ApiResponse<BlogPostDTO>> updatePost(
            @PathVariable Long id,
            @RequestBody @Valid CreateBlogPostRequest request
    ) {
        BlogPost postDetails = blogMapper.toPostEntity(request);

        BlogPost updatedPost = blogService.updatePost(
                id,
                postDetails,
                authenticationService.getCurrentUser()
        );

        return ApiResponses.success(
                HttpStatus.OK, blogMapper.toPostDTO(updatedPost), "Post updated successfully"
        );
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<BlogCommentDTO>> addComment(
            @PathVariable Long id,
            @RequestBody @Valid CreateBlogCommentRequest addedComment
    ) {
        BlogComment comment = blogService.addComment(
                id, addedComment.getContent(), authenticationService.getCurrentUser()
        );
        return ApiResponses.success(
                HttpStatus.CREATED, blogMapper.toCommentDTO(comment), "Comment added"
        );
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(@PathVariable Long id) {
        blogService.deleteComment(id, authenticationService.getCurrentUser());
        return ApiResponses.success(
                HttpStatus.NO_CONTENT, null, "Comment deleted"
        );
    }

    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("@blogSecurity.hasEditPermissionsForPost(#id, principal)")
    public ResponseEntity<ApiResponse<Void>> uploadPostImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        blogService.uploadPostImage(id, file);
        return ApiResponses.success(
                HttpStatus.OK, null, "Post image updated successfully"
        );
    }

    @GetMapping("/images/{imageId}")
    public ResponseEntity<byte[]> getPostImage(@PathVariable Long imageId) {
        BlogPostImage image = blogService.getPostImageById(imageId);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(14, TimeUnit.DAYS))
                .contentType(MediaType.parseMediaType(image.getContentType()))
                .body(image.getImageData());
    }

}