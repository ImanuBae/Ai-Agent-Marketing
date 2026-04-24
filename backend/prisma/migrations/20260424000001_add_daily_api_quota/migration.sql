-- CreateTable: track daily Gemini API quota usage, survives server restarts
CREATE TABLE "daily_api_quotas" (
    "id" TEXT NOT NULL,
    "dateKey" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "requestCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_api_quotas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: composite unique on date+model ensures one row per model per day
CREATE UNIQUE INDEX "daily_api_quotas_dateKey_model_key" ON "daily_api_quotas"("dateKey", "model");
