CREATE INDEX IF NOT EXISTS idx_recipes_diet_meal_type
    ON recipes (diet_type_id, meal_type);

CREATE INDEX IF NOT EXISTS idx_user_measurements_user_date
    ON user_measurements (user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_blog_comments_post_created
    ON blog_comments (post_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_user_created
    ON orders (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_users_active_email
    ON users (email) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_payments_pending
    ON payments (user_id, local_order_id) WHERE status = 'PENDING';

CREATE INDEX IF NOT EXISTS idx_recovery_tokens_expiry
    ON password_recovery_tokens (expiry_date, token);
