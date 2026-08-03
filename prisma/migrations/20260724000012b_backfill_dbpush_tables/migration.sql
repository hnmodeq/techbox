-- Recreate the ten models that only ever existed via `prisma db push`.
--
-- WHY THIS EXISTS
-- ---------------
-- AuditLog, ConsultationRequest, Follow, IpBan, Order, OrderItem,
-- SavedContent, SearchLog, TeamMember and TeamSection are declared in
-- schema.prisma and used in production, but no migration ever created them —
-- they were applied straight to the live database with `db push`. The
-- migration chain was therefore not replayable: on an empty database
-- `migrate deploy` died at 20260725000013_secure_shop_orders with
-- `relation "Order" does not exist` (SQLSTATE 42P01).
--
-- That made the schema unrebuildable from source: no disaster recovery, no
-- ephemeral CI database, no clean local bootstrap. It surfaced when the E2E
-- job was given a real Postgres instead of running with no DATABASE_URL.
--
-- ORDERING
-- --------
-- Dated 20260724 so it lands *before* 20260725000013_secure_shop_orders,
-- which alters "Order". "Order" is created here in its PRE-13 shape — with
-- `paymentId`, without `paymentAuthority`/`paymentReference`/
-- `accessTokenHash` — so migration 13 still performs the split it was
-- written to perform. Every other table is created in its current shape.
--
-- IDEMPOTENCE
-- -----------
-- Every statement is IF NOT EXISTS. The production database already has
-- these objects, so this must be a no-op there; `migrate resolve --applied`
-- is the alternative, but idempotent DDL means the same file is safe whether
-- or not the tables are present.

;

-- CreateTable
CREATE TABLE IF NOT EXISTS "IpBan" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "reason" TEXT,
    "bannedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IpBan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Follow" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "SavedContent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ConsultationRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "userName" TEXT,
    "userEmail" TEXT,
    "items" JSONB NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsultationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "userName" TEXT NOT NULL DEFAULT '',
    "action" TEXT NOT NULL,
    "target" TEXT,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "SearchLog" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "results" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Order" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "userId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT,
    "customerPhone" TEXT NOT NULL,
    "customerAddress" TEXT NOT NULL,
    "customerPostalCode" TEXT NOT NULL,
    "customerCity" TEXT,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "shippingCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'IRR',
    "paymentMethod" TEXT,
    "paymentId" TEXT,
    "paidAt" TIMESTAMP(3),
    "adminNote" TEXT,
    "customerNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "postId" TEXT,
    "slug" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "image" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "TeamSection" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "TeamMember" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT DEFAULT '',
    "avatar" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "IpBan_ip_key" ON "IpBan"("ip");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "IpBan_ip_idx" ON "IpBan"("ip");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "IpBan_createdAt_idx" ON "IpBan"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Follow_followingId_idx" ON "Follow"("followingId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Follow_followerId_idx" ON "Follow"("followerId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Follow_followerId_followingId_key" ON "Follow"("followerId", "followingId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SavedContent_user_created_idx" ON "SavedContent"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "SavedContent_userId_module_slug_key" ON "SavedContent"("userId", "module", "slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "consultation_status_created_idx" ON "ConsultationRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "consultation_created_idx" ON "ConsultationRequest"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SearchLog_createdAt_idx" ON "SearchLog"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SearchLog_query_createdAt_idx" ON "SearchLog"("query", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Order_status_createdAt_idx" ON "Order"("status", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Order_orderNumber_idx" ON "Order"("orderNumber");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TeamSection_enabled_order_idx" ON "TeamSection"("enabled", "order");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TeamMember_sectionId_order_idx" ON "TeamMember"("sectionId", "order");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Follow_followerId_fkey') THEN
    ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Follow_followingId_fkey') THEN
    ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'OrderItem_orderId_fkey') THEN
    ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TeamMember_sectionId_fkey') THEN
    ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "TeamSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
