-- Ticket conversation system: TicketReply model for threaded replies on
-- support tickets (ContactSubmission type=support). Both user and admin
-- messages live here.
CREATE TABLE "TicketReply" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorEmail" TEXT,
    "authorRole" TEXT NOT NULL DEFAULT 'user',
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketReply_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TicketReply_ticketId_createdAt_idx" ON "TicketReply"("ticketId", "createdAt");

ALTER TABLE "TicketReply"
ADD CONSTRAINT "TicketReply_ticketId_fkey"
FOREIGN KEY ("ticketId") REFERENCES "ContactSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Index for looking up a user's tickets by email (for the "my tickets" view)
CREATE INDEX "ContactSubmission_email_type_createdAt_idx" ON "ContactSubmission"("email", "type", "createdAt");
