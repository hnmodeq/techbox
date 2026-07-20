-- Add verification fields to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "verifiedType" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "verifiedLabel" TEXT;

-- VerificationRequest model
CREATE TABLE IF NOT EXISTS "VerificationRequest" (
  "id"           TEXT NOT NULL,
  "userId"       TEXT NOT NULL,
  "type"         TEXT NOT NULL, -- "content" | "org" | "user"
  "status"       TEXT NOT NULL DEFAULT 'pending', -- "pending" | "approved" | "denied"
  "message"      TEXT NOT NULL,
  "phone"        TEXT,
  "nationalId"   TEXT,
  "modules"      TEXT[],
  "orgName"      TEXT,
  "orgNationalId" TEXT,
  "orgPosition"  TEXT,
  "orgApplicantName" TEXT,
  "adminNote"    TEXT,
  "reviewedBy"   TEXT,
  "reviewedAt"   TIMESTAMP(3),
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VerificationRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "VerificationRequest_userId_idx" ON "VerificationRequest"("userId");
CREATE INDEX IF NOT EXISTS "VerificationRequest_status_idx" ON "VerificationRequest"("status");
CREATE INDEX IF NOT EXISTS "VerificationRequest_createdAt_idx" ON "VerificationRequest"("createdAt");

ALTER TABLE "VerificationRequest"
  ADD CONSTRAINT "VerificationRequest_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
