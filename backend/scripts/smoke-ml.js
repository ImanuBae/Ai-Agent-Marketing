const path = require('path');
const XLSX = require('xlsx');

const { scoreCampaign } = require('../dist/services/ml-campaign.service');

const samplePath = path.join(__dirname, '..', 'data', 'sample-campaign-skincare.xlsx');
const workbook = XLSX.readFile(samplePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });

const result = scoreCampaign(rows);

if (result.modelR2 < 0.8) {
  throw new Error(`Expected model R2 >= 0.8, got ${result.modelR2}`);
}

if (result.predictedVsActual.length < 10) {
  throw new Error(`Expected at least 10 predicted points, got ${result.predictedVsActual.length}`);
}

console.log(JSON.stringify({
  modelVersion: result.modelVersion,
  modelR2: result.modelR2,
  userR2: result.userR2,
  mape: result.mape,
  effectivenessScore: result.effectivenessScore,
  recommendation: result.recommendation,
  points: result.predictedVsActual.length,
}, null, 2));

const platformResult = scoreCampaign([
  { date: '2026-01', facebook: 30, instagram: 100, threads: 10, tiktok: 140, sales: 18 },
  { date: '2026-02', facebook: 35, instagram: 120, threads: 12, tiktok: 170, sales: 22 },
  { date: '2026-03', facebook: 40, instagram: 150, threads: 15, tiktok: 200, sales: 27 },
]);

if (platformResult.modelVersion !== 'platform-baseline-v1') {
  throw new Error(`Expected platform-baseline-v1, got ${platformResult.modelVersion}`);
}

if (platformResult.analysisMode !== 'channel') {
  throw new Error(`Expected channel mode for platform data, got ${platformResult.analysisMode}`);
}

console.log(JSON.stringify({
  modelVersion: platformResult.modelVersion,
  analysisMode: platformResult.analysisMode,
  channelImpact: platformResult.channelImpact,
}, null, 2));
