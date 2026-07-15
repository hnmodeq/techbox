-- Persist per-user read state for news shown in the top bar / news sidebar.
CREATE TABLE "UserNewsRead" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserNewsRead_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserNewsRead_userId_slug_key" ON "UserNewsRead"("userId", "slug");
CREATE INDEX "user_news_read_user_read_idx" ON "UserNewsRead"("userId", "readAt");
CREATE INDEX "user_news_read_slug_idx" ON "UserNewsRead"("slug");

ALTER TABLE "UserNewsRead"
ADD CONSTRAINT "UserNewsRead_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
