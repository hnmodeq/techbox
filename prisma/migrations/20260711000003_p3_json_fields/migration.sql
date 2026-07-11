-- P3-5: native Json columns instead of stringified JSON
-- Convert the existing text/"[]" (or "{}") values into jsonb.
-- Drop the old text defaults first: Postgres cannot auto-cast a text DEFAULT
-- expression to jsonb, so the type change must happen without a default, then
-- the jsonb default is re-added.

ALTER TABLE "User" ALTER COLUMN "modules" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "modules" TYPE jsonb USING COALESCE("modules", '[]')::jsonb;
ALTER TABLE "User" ALTER COLUMN "modules" SET DEFAULT '[]'::jsonb;

ALTER TABLE "Post" ALTER COLUMN "gallery" DROP DEFAULT;
ALTER TABLE "Post" ALTER COLUMN "gallery" TYPE jsonb USING COALESCE("gallery", '[]')::jsonb;
ALTER TABLE "Post" ALTER COLUMN "gallery" SET DEFAULT '[]'::jsonb;

ALTER TABLE "Post" ALTER COLUMN "tags" DROP DEFAULT;
ALTER TABLE "Post" ALTER COLUMN "tags" TYPE jsonb USING COALESCE("tags", '[]')::jsonb;
ALTER TABLE "Post" ALTER COLUMN "tags" SET DEFAULT '[]'::jsonb;

ALTER TABLE "Post" ALTER COLUMN "specs" DROP DEFAULT;
ALTER TABLE "Post" ALTER COLUMN "specs" TYPE jsonb USING COALESCE("specs", '{}')::jsonb;
ALTER TABLE "Post" ALTER COLUMN "specs" SET DEFAULT '{}'::jsonb;

ALTER TABLE "TimelineEvent" ALTER COLUMN "tags" DROP DEFAULT;
ALTER TABLE "TimelineEvent" ALTER COLUMN "tags" TYPE jsonb USING COALESCE("tags", '[]')::jsonb;
ALTER TABLE "TimelineEvent" ALTER COLUMN "tags" SET DEFAULT '[]'::jsonb;
