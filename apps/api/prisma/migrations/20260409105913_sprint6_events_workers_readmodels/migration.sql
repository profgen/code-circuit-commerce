-- AlterTable
ALTER TABLE "JobQueue" ADD COLUMN     "nextRunAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "DomainEvent" (
    "id" TEXT NOT NULL,
    "aggregateType" TEXT NOT NULL,
    "aggregateId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DomainEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderReadModel" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "itemCount" INTEGER NOT NULL,
    "latestEvent" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderReadModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductReadModel" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "categorySlug" TEXT,
    "price" INTEGER NOT NULL,
    "recommendationCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductReadModel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderReadModel_orderId_key" ON "OrderReadModel"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductReadModel_productId_key" ON "ProductReadModel"("productId");
