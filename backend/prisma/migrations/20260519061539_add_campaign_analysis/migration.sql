-- CreateTable
CREATE TABLE "sales_reports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sales_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_analyses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "salesReportId" TEXT NOT NULL,
    "analysisText" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "effectivenessScore" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_analyses_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "sales_reports" ADD CONSTRAINT "sales_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_analyses" ADD CONSTRAINT "campaign_analyses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_analyses" ADD CONSTRAINT "campaign_analyses_salesReportId_fkey" FOREIGN KEY ("salesReportId") REFERENCES "sales_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
