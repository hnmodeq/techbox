-- Accepted/best answer for forum topics.
-- Post.acceptedCommentId points at the Comment the topic creator selected as the
-- best answer; selecting it also marks the topic solved (closed). onDelete
-- SetNull keeps the post intact if the accepted comment is ever deleted.
ALTER TABLE "Post" ADD COLUMN "acceptedCommentId" TEXT;

ALTER TABLE "Post"
ADD CONSTRAINT "Post_acceptedCommentId_fkey"
FOREIGN KEY ("acceptedCommentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE UNIQUE INDEX "Post_acceptedCommentId_key" ON "Post"("acceptedCommentId");
