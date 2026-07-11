-- P3-2: editorial states (draft / review / published / archived)
ALTER TABLE "Post" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'published';
