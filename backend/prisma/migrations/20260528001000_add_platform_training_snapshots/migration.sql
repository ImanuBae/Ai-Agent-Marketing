CREATE TABLE "platform_training_snapshots" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "salesReportId" TEXT NOT NULL,
  "rowCount" INTEGER NOT NULL,
  "rows" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "platform_training_snapshots_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "platform_training_snapshots_salesReportId_key"
ON "platform_training_snapshots"("salesReportId");

ALTER TABLE "platform_training_snapshots"
ADD CONSTRAINT "platform_training_snapshots_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "platform_training_snapshots"
ADD CONSTRAINT "platform_training_snapshots_salesReportId_fkey"
FOREIGN KEY ("salesReportId") REFERENCES "sales_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
