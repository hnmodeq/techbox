-- P3-3: speed up the existing ILIKE (contains) search queries with pg_trgm GIN indexes
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "post_title_trgm" ON "Post" USING gin ("title" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "post_excerpt_trgm" ON "Post" USING gin ("excerpt" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "post_content_trgm" ON "Post" USING gin ("content" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "post_category_trgm" ON "Post" USING gin ("category" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "post_authorname_trgm" ON "Post" USING gin ("authorName" gin_trgm_ops);
