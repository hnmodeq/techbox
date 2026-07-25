-- Make Role/UserRole part of the migration history. Earlier deployments may
-- already have these tables from `prisma db push`, so all DDL is idempotent.
CREATE TABLE IF NOT EXISTS "Role" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "nameFa" TEXT NOT NULL,
  "description" TEXT,
  "permissions" JSONB NOT NULL,
  "isSystem" BOOLEAN NOT NULL DEFAULT false,
  "color" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "UserRole" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "roleId" TEXT NOT NULL,
  "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "assignedBy" TEXT,
  CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Role_name_key" ON "Role"("name");
CREATE INDEX IF NOT EXISTS "Role_isSystem_idx" ON "Role"("isSystem");
CREATE UNIQUE INDEX IF NOT EXISTS "UserRole_userId_roleId_key" ON "UserRole"("userId", "roleId");
CREATE INDEX IF NOT EXISTS "UserRole_userId_idx" ON "UserRole"("userId");
CREATE INDEX IF NOT EXISTS "UserRole_roleId_idx" ON "UserRole"("roleId");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserRole_userId_fkey') THEN
    ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserRole_roleId_fkey') THEN
    ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey"
      FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- One-time compatibility roles preserve each legacy editor's module scope.
-- Runtime authorization no longer reads User.modules after these assignments.
INSERT INTO "Role" ("id", "name", "nameFa", "description", "permissions", "isSystem", "color") VALUES
('legacy-content-blog', 'legacy_content_blog', 'مدیریت مجله', 'Backfilled from legacy module access', '["content:blog:view","content:blog:create","content:blog:edit","content:blog:delete","content:blog:publish"]'::jsonb, true, '#3b82f6'),
('legacy-content-news', 'legacy_content_news', 'مدیریت اخبار', 'Backfilled from legacy module access', '["content:news:view","content:news:create","content:news:edit","content:news:delete","content:news:publish"]'::jsonb, true, '#3b82f6'),
('legacy-content-media', 'legacy_content_media', 'مدیریت رسانه', 'Backfilled from legacy module access', '["content:media:view","content:media:create","content:media:edit","content:media:delete","content:media:publish","blob:upload"]'::jsonb, true, '#3b82f6'),
('legacy-content-review', 'legacy_content_review', 'مدیریت بررسی', 'Backfilled from legacy module access', '["content:review:view","content:review:create","content:review:edit","content:review:delete","content:review:publish"]'::jsonb, true, '#3b82f6'),
('legacy-content-download', 'legacy_content_download', 'مدیریت دانلود', 'Backfilled from legacy module access', '["content:download:view","content:download:create","content:download:edit","content:download:delete","content:download:publish","blob:upload"]'::jsonb, true, '#3b82f6'),
('legacy-content-forum', 'legacy_content_forum', 'مدیریت انجمن', 'Backfilled from legacy module access', '["content:forum:view","content:forum:create","content:forum:edit","content:forum:delete","content:forum:publish","forum:moderate"]'::jsonb, true, '#3b82f6'),
('legacy-content-tools', 'legacy_content_tools', 'مدیریت ابزارها', 'Backfilled from legacy module access', '["content:tools:view","content:tools:create","content:tools:edit","content:tools:delete","content:tools:publish"]'::jsonb, true, '#3b82f6'),
('legacy-content-timeline', 'legacy_content_timeline', 'مدیریت تایم‌لاین', 'Backfilled from legacy module access', '["content:timeline:view","content:timeline:create","content:timeline:edit","content:timeline:delete","content:timeline:publish","timeline:view"]'::jsonb, true, '#3b82f6'),
('legacy-product-shop', 'legacy_product_shop', 'مدیریت فروشگاه', 'Backfilled from legacy module access', '["product:list:view","product:create","product:delete","product:basic:view","product:basic:edit","product:seo:view","product:seo:edit","product:content:view","product:content:edit","product:media:view","product:media:edit","product:download:view","product:download:edit","product:review:view","product:review:edit","product:info:view","product:info:edit","product:price:view","product:price:edit","product:specs:view","product:specs:edit","product:gallery:view","product:gallery:edit","product:status:view","product:status:edit","product:series:view","product:series:edit","blob:upload"]'::jsonb, true, '#22c55e'),
('legacy-jobs', 'legacy_jobs', 'مدیریت استخدام', 'Backfilled from legacy module access', '["job:view","job:edit","job:applications"]'::jsonb, true, '#8b5cf6')
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "UserRole" ("id", "userId", "roleId", "assignedBy")
SELECT 'legacy-' || u."id" || '-' || mapping.slug, u."id", mapping.role_id, 'migration'
FROM "User" u
CROSS JOIN (VALUES
  ('blog', 'legacy-content-blog'),
  ('news', 'legacy-content-news'),
  ('media', 'legacy-content-media'),
  ('review', 'legacy-content-review'),
  ('download', 'legacy-content-download'),
  ('forum', 'legacy-content-forum'),
  ('tools', 'legacy-content-tools'),
  ('timeline', 'legacy-content-timeline'),
  ('shop', 'legacy-product-shop'),
  ('workwithus', 'legacy-jobs')
) AS mapping(slug, role_id)
WHERE u."role" <> 'super_admin'
  AND jsonb_typeof(u."modules") = 'array'
  AND u."modules" ? mapping.slug
ON CONFLICT ("userId", "roleId") DO NOTHING;
