-- Newsletter campaign system.
-- Adds a per-subscriber unsubscribe token (so email links can unsubscribe
-- without exposing/parsing the email) + an unsubscribedAt timestamp, and a
-- NewsletterCampaign table to record each sent blast for admin history.

-- IMPORTANT: add the column as NULLABLE first, backfill existing rows, THEN
-- enforce NOT NULL + unique. Adding NOT NULL without a default fails when the
-- table already has rows (ERROR 23502).

ALTER TABLE "NewsletterSubscriber" ADD COLUMN "unsubscribeToken" TEXT;
ALTER TABLE "NewsletterSubscriber" ADD COLUMN "unsubscribedAt" TIMESTAMP(3);

-- Backfill from the row's id — already unique (it's the PK), so the unique
-- index below is guaranteed satisfiable. New rows get an auto-generated cuid
-- via the Prisma @default(cuid()).
UPDATE "NewsletterSubscriber" SET "unsubscribeToken" = "id" WHERE "unsubscribeToken" IS NULL;

ALTER TABLE "NewsletterSubscriber" ALTER COLUMN "unsubscribeToken" SET NOT NULL;

CREATE UNIQUE INDEX "NewsletterSubscriber_unsubscribeToken_key" ON "NewsletterSubscriber"("unsubscribeToken");

CREATE TABLE "NewsletterCampaign" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "headerHtml" TEXT,
    "footerHtml" TEXT,
    "items" JSONB NOT NULL,
    "recipientCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "sentBy" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsletterCampaign_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "NewsletterCampaign_sentAt_idx" ON "NewsletterCampaign"("sentAt");
