-- CreateTable
CREATE TABLE "SettlementEntry" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "sellerProfileId" TEXT,
    "type" TEXT NOT NULL,
    "grossAmount" INTEGER NOT NULL,
    "commissionAmount" INTEGER NOT NULL,
    "netAmount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'AED',
    "status" TEXT NOT NULL DEFAULT 'POSTED',
    "reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SettlementEntry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SettlementEntry" ADD CONSTRAINT "SettlementEntry_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SettlementEntry" ADD CONSTRAINT "SettlementEntry_sellerProfileId_fkey" FOREIGN KEY ("sellerProfileId") REFERENCES "SellerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
