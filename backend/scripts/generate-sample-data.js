/**
 * Generates sample-campaign-skincare.xlsx
 * Simulates 90 days (Feb 1 – Apr 30 2026) of a skincare product marketing campaign.
 *
 * Run: node scripts/generate-sample-data.js
 */

const XLSX = require('xlsx');
const path = require('path');

// ── Config ────────────────────────────────────────────────────────────────────

const START_DATE = new Date('2026-02-01');
const DAYS = 90;

// Base daily revenue (VND). Grows ~15% over the 90-day campaign.
const BASE_REVENUE = 4_500_000;
const GROWTH_RATE = 0.0015; // 0.15% compound daily

// Posting schedule: 3 posts/week on Mon, Wed, Fri; 2 posts/week on Tue, Thu in Feb;
// ramps to 5 posts/week in Apr (Mon-Fri).
function postsForDate(date) {
  const day = date.getDay(); // 0=Sun … 6=Sat
  const month = date.getMonth(); // 0-indexed
  if (month === 1) {
    // February — 3x/week
    return [1, 3, 5].includes(day) ? 1 : 0;
  } else if (month === 2) {
    // March — 4x/week
    return [1, 2, 3, 5].includes(day) ? 1 : 0;
  } else {
    // April — 5x/week
    return [1, 2, 3, 4, 5].includes(day) ? 1 : 0;
  }
}

function platformForDate(date) {
  const day = date.getDay();
  if (day === 1 || day === 4) return 'facebook';
  if (day === 2 || day === 5) return 'instagram';
  if (day === 3) return 'both';
  return '';
}

// AI content percentage: starts at 40%, grows to 85% as team adopts AI more.
function aiContentPct(dayIndex) {
  return Math.min(85, Math.round(40 + dayIndex * 0.5));
}

function rnd(min, max) {
  return Math.round(min + Math.random() * (max - min));
}

// ── Generate rows ─────────────────────────────────────────────────────────────

const rows = [];

for (let i = 0; i < DAYS; i++) {
  const date = new Date(START_DATE);
  date.setDate(START_DATE.getDate() + i);

  const posts = postsForDate(date);
  const baseRev = BASE_REVENUE * Math.pow(1 + GROWTH_RATE, i);

  // Revenue spikes on post days (+25–45%) and weekends spike too (word-of-mouth)
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const postMultiplier = posts > 0 ? 1 + (0.25 + Math.random() * 0.20) : 1;
  const weekendMultiplier = isWeekend ? 1 + Math.random() * 0.15 : 1;
  const noise = 0.92 + Math.random() * 0.16; // ±8% random noise

  const revenue = Math.round(baseRev * postMultiplier * weekendMultiplier * noise);
  const unitsSold = Math.round(revenue / rnd(95_000, 115_000)); // avg price ~100k VND

  // Reach: 0 on no-post days, 2000–8000 on post days
  const reach = posts > 0 ? rnd(2_500, 8_000) + i * 30 : rnd(100, 400);

  // Engagement rate: 3–8% on post days, 0.5–2% otherwise
  const engagementRate = posts > 0
    ? parseFloat((3 + Math.random() * 5).toFixed(2))
    : parseFloat((0.5 + Math.random() * 1.5).toFixed(2));

  // Clicks: correlated with reach and engagement
  const clicks = posts > 0 ? Math.round(reach * engagementRate / 100 * rnd(3, 7)) : rnd(0, 20);

  const platform = platformForDate(date);

  rows.push({
    Date: date.toISOString().split('T')[0],
    Revenue: revenue,
    UnitsSold: unitsSold,
    PostsPublished: posts,
    AIContentPct: posts > 0 ? aiContentPct(i) : 0,
    Reach: reach,
    EngagementRate: engagementRate,
    Clicks: clicks,
    Platform: platform,
  });
}

// ── Write Excel ───────────────────────────────────────────────────────────────

const ws = XLSX.utils.json_to_sheet(rows);

// Column widths
ws['!cols'] = [
  { wch: 12 }, // Date
  { wch: 14 }, // Revenue
  { wch: 12 }, // UnitsSold
  { wch: 15 }, // PostsPublished
  { wch: 14 }, // AIContentPct
  { wch: 10 }, // Reach
  { wch: 16 }, // EngagementRate
  { wch: 10 }, // Clicks
  { wch: 12 }, // Platform
];

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Campaign Data');

const outPath = path.join(__dirname, '../data/sample-campaign-skincare.xlsx');
XLSX.writeFile(wb, outPath);

console.log(`✅ Generated ${rows.length} rows → ${outPath}`);
console.log(`   Revenue range: ${rows[0].Revenue.toLocaleString()} → ${rows[rows.length - 1].Revenue.toLocaleString()} VND/day`);
console.log(`   Total revenue: ${rows.reduce((s, r) => s + r.Revenue, 0).toLocaleString()} VND`);
