-- Newsletter campaign system.
-- Adds a per-subscriber unsubscribe token (so email links can unsubscribe
-- without exposing/parsing the email) + an unsubscribedAt timestamp, and a
-- NewsletterCampaign table to record each sent blast for admin history.

ALTER TABLE "NewsletterSubscriber" ADD COLUMN "unsubscribeToken" TEXT NOT NULL;
ALTER TABLE "NewsletterSubscriber" ADD COLUMN "unsubscribedAt" TIMESTAMP(3);

-- Backfill unique tokens for any existing subscribers (none in practice right
-- now, but keeps the unique constraint satisfiable on backfill).
UPDATE "NewsletterSubscriber" SET "unsubscribeToken" = gen_random_uuid() WHERE "unsubscribeToken" = '' OR "unsubscribeToken" IS NULL;
UPDATE "NewsletterSubscriber" SET "unsubscribeToken" = id WHERE "unsubscribeToken" IS NULL;

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
