-- Prisma baseline migration
-- This captures the current state of the database as it exists after `db push`.
-- Run `prisma migrate resolve --applied 0_init` to mark this as already applied
-- on an existing database. On a fresh database, run `prisma migrate deploy`.

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "roleFa" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "job" TEXT,
    "birthday" TEXT,
    "modules" TEXT NOT NULL DEFAULT '[]',
    "avatar" TEXT,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "image" TEXT,
    "videoUrl" TEXT,
    "videoDuration" TEXT,
    "videoMimeType" TEXT,
    "videoFileSize" TEXT,
    "gallery" TEXT NOT NULL DEFAULT '[]',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "category" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "brand" TEXT,
    "model" TEXT,
    "sku" TEXT,
    "priceLabel" TEXT,
    "availability" TEXT,
    "warranty" TEXT,
    "specs" TEXT NOT NULL DEFAULT '{}',
    "authorId" TEXT,
    "authorName" TEXT NOT NULL DEFAULT 'تحریریه',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateFa" TEXT NOT NULL DEFAULT '',
    "likes" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "solved" BOOLEAN DEFAULT false,
    "fileName" TEXT,
    "fileUrl" TEXT,
    "fileSize" TEXT,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserNotificationState" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastReadAt" TIMESTAMP(3) NOT NULL DEFAULT '1970-01-01 00:00:00'::timestamp,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserNotificationState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "parentId" TEXT,
    "authorId" TEXT,
    "authorName" TEXT NOT NULL DEFAULT 'مهمان',
    "text" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'approved',
    "likes" INTEGER NOT NULL DEFAULT 0,
    "dislikes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommentVote" (
    "id" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "vote" INTEGER NOT NULL,

    CONSTRAINT "CommentVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Like" (
    "id" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "userId" TEXT,
    "module" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SlugRedirect" (
    "id" TEXT NOT NULL,
    "sourceModule" TEXT NOT NULL,
    "sourceSlug" TEXT NOT NULL,
    "targetModule" TEXT NOT NULL,
    "targetSlug" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SlugRedirect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostRevision" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "oldTitle" TEXT,
    "oldContent" TEXT,
    "oldImage" TEXT,
    "editedBy" TEXT,
    "editedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT,
    "dateGr" TIMESTAMP(3) NOT NULL,
    "dateFa" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "yearFa" INTEGER NOT NULL,
    "importance" INTEGER NOT NULL DEFAULT 5,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineComment" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "parentId" TEXT,
    "authorName" TEXT NOT NULL DEFAULT 'مهمان',
    "text" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'approved',
    "likes" INTEGER NOT NULL DEFAULT 0,
    "dislikes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimelineComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineCommentVote" (
    "id" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "vote" INTEGER NOT NULL,

    CONSTRAINT "TimelineCommentVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineLike" (
    "id" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "userId" TEXT,
    "eventId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimelineLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterSubscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "remote" BOOLEAN NOT NULL DEFAULT false,
    "team" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "resumeUrl" TEXT NOT NULL,
    "resumeName" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactSubmission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "user_role_status_idx" ON "User"("role", "status");
CREATE INDEX "user_status_idx" ON "User"("status");

CREATE UNIQUE INDEX "Post_module_slug_key" ON "Post"("module", "slug");
CREATE INDEX "post_module_published_date_idx" ON "Post"("module", "published", "date");
CREATE INDEX "post_published_date_idx" ON "Post"("published", "date");
CREATE INDEX "post_author_idx" ON "Post"("authorId");
CREATE INDEX "post_module_category_idx" ON "Post"("module", "category");
CREATE INDEX "post_module_published_views_idx" ON "Post"("module", "published", "views");
CREATE INDEX "post_module_published_likes_idx" ON "Post"("module", "published", "likes");
CREATE INDEX "post_module_published_rating_idx" ON "Post"("module", "published", "rating");
CREATE INDEX "post_date_idx" ON "Post"("date");

CREATE UNIQUE INDEX "UserNotificationState_userId_key" ON "UserNotificationState"("userId");
CREATE INDEX "user_notification_last_read_idx" ON "UserNotificationState"("lastReadAt");

CREATE UNIQUE INDEX "Rating_postId_userId_key" ON "Rating"("postId", "userId");
CREATE INDEX "rating_post_idx" ON "Rating"("postId");
CREATE INDEX "rating_user_idx" ON "Rating"("userId");
CREATE INDEX "rating_created_idx" ON "Rating"("createdAt");

CREATE INDEX "comment_post_status_created_idx" ON "Comment"("postId", "status", "createdAt");
CREATE INDEX "comment_author_created_idx" ON "Comment"("authorId", "createdAt");
CREATE INDEX "comment_parent_idx" ON "Comment"("parentId");
CREATE INDEX "comment_status_created_idx" ON "Comment"("status", "createdAt");

CREATE UNIQUE INDEX "fingerprint_commentId_key" ON "CommentVote"("fingerprint", "commentId");
CREATE INDEX "comment_vote_comment_idx" ON "CommentVote"("commentId");

CREATE UNIQUE INDEX "fingerprint_module_slug_key" ON "Like"("fingerprint", "module", "slug");
CREATE INDEX "like_module_slug_created_idx" ON "Like"("module", "slug", "createdAt");
CREATE INDEX "like_user_created_idx" ON "Like"("userId", "createdAt");
CREATE INDEX "like_created_idx" ON "Like"("createdAt");

CREATE UNIQUE INDEX "source_module_slug_key" ON "SlugRedirect"("sourceModule", "sourceSlug");
CREATE INDEX "redirect_target_idx" ON "SlugRedirect"("targetModule", "targetSlug");
CREATE INDEX "redirect_created_idx" ON "SlugRedirect"("createdAt");

CREATE INDEX "post_revision_post_edited_idx" ON "PostRevision"("postId", "editedAt");

CREATE UNIQUE INDEX "TimelineEvent_dateGr_key" ON "TimelineEvent"("dateGr");
CREATE UNIQUE INDEX "TimelineEvent_dateFa_key" ON "TimelineEvent"("dateFa");
CREATE INDEX "timeline_event_published_date_idx" ON "TimelineEvent"("published", "dateGr");
CREATE INDEX "timeline_event_year_idx" ON "TimelineEvent"("year");
CREATE INDEX "timeline_event_importance_idx" ON "TimelineEvent"("importance");

CREATE INDEX "timeline_comment_event_status_created_idx" ON "TimelineComment"("eventId", "status", "createdAt");
CREATE INDEX "timeline_comment_parent_idx" ON "TimelineComment"("parentId");
CREATE INDEX "timeline_comment_status_created_idx" ON "TimelineComment"("status", "createdAt");

CREATE UNIQUE INDEX "timeline_fingerprint_commentId_key" ON "TimelineCommentVote"("fingerprint", "commentId");
CREATE INDEX "timeline_comment_vote_comment_idx" ON "TimelineCommentVote"("commentId");

CREATE UNIQUE INDEX "timeline_fingerprint_eventId_key" ON "TimelineLike"("fingerprint", "eventId");
CREATE INDEX "timeline_like_event_created_idx" ON "TimelineLike"("eventId", "createdAt");
CREATE INDEX "timeline_like_user_created_idx" ON "TimelineLike"("userId", "createdAt");
CREATE INDEX "timeline_like_created_idx" ON "TimelineLike"("createdAt");

CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");
CREATE INDEX "NewsletterSubscriber_active_createdAt_idx" ON "NewsletterSubscriber"("active", "createdAt");

CREATE INDEX "PasswordResetToken_token_idx" ON "PasswordResetToken"("token");
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");

CREATE UNIQUE INDEX "Job_slug_key" ON "Job"("slug");
CREATE INDEX "Job_active_order_idx" ON "Job"("active", "order");

CREATE INDEX "JobApplication_jobId_idx" ON "JobApplication"("jobId");
CREATE INDEX "JobApplication_status_idx" ON "JobApplication"("status");

CREATE INDEX "ContactSubmission_createdAt_idx" ON "ContactSubmission"("createdAt");

CREATE UNIQUE INDEX "SiteSetting_key_key" ON "SiteSetting"("key");
CREATE INDEX "SiteSetting_key_idx" ON "SiteSetting"("key");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "UserNotificationState" ADD CONSTRAINT "UserNotificationState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CommentVote" ADD CONSTRAINT "CommentVote_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PostRevision" ADD CONSTRAINT "PostRevision_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TimelineComment" ADD CONSTRAINT "TimelineComment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "TimelineEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TimelineComment" ADD CONSTRAINT "TimelineComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "TimelineComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TimelineCommentVote" ADD CONSTRAINT "TimelineCommentVote_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "TimelineComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TimelineLike" ADD CONSTRAINT "TimelineLike_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "TimelineEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
