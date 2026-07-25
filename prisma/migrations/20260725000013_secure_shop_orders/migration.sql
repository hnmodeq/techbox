-- Split the overloaded payment identifier into gateway authority/reference fields
-- and add a hashed capability token for authenticated guest-order access.
ALTER TABLE "Order"
  ADD COLUMN "paymentAuthority" TEXT,
  ADD COLUMN "paymentReference" TEXT,
  ADD COLUMN "accessTokenHash" TEXT;

UPDATE "Order"
SET "paymentReference" = "paymentId"
WHERE "status" = 'paid' AND "paymentId" IS NOT NULL;

UPDATE "Order"
SET "paymentAuthority" = "paymentId"
WHERE "status" = 'pending' AND "paymentMethod" = 'zarinpal' AND "paymentId" IS NOT NULL;

ALTER TABLE "Order" DROP COLUMN "paymentId";

CREATE UNIQUE INDEX "Order_paymentAuthority_key" ON "Order"("paymentAuthority");
CREATE UNIQUE INDEX "Order_accessTokenHash_key" ON "Order"("accessTokenHash");
