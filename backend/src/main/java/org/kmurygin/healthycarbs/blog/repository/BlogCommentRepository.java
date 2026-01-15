package org.kmurygin.healthycarbs.blog.repository;

import org.kmurygin.healthycarbs.blog.model.BlogComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BlogCommentRepository extends JpaRepository<BlogComment, Long> {
}