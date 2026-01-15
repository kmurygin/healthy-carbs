package org.kmurygin.healthycarbs.blog.repository;

import org.kmurygin.healthycarbs.blog.model.BlogPostImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BlogPostImageRepository extends JpaRepository<BlogPostImage, Long> {
}
