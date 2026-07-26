-- Companies TechBox works with, shown on the homepage.
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "url" TEXT,
    "tagline" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Partner_published_order_idx" ON "Partner"("published", "order");
