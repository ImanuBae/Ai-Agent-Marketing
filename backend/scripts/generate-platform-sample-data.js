/**
 * Generates synthetic platform-channel campaign data for testing the app schema.
 *
 * Output columns:
 * date, facebook, instagram, threads, tiktok, sales
 *
 * This is NOT a real public dataset. It is deterministic demo data for testing
 * upload, mapping, snapshot export, and platform-baseline retraining.
 */

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const OUT_CSV = path.join(__dirname, '../data/sample-platform-campaign.csv');
const OUT_XLSX = path.join(__dirname, '../data/sample-platform-campaign.xlsx');

const START_DATE = new Date('2026-01-01');
const DAYS = 90;

function round(value) {
  return Math.round(value);
}

function wave(day, period, amplitude) {
  return Math.sin((day / period) * Math.PI * 2) * amplitude;
}

function rowForDay(index) {
  const date = new Date(START_DATE);
  date.setDate(START_DATE.getDate() + index);

  const weekdayBoost = [0, 6].includes(date.getDay()) ? 0.86 : 1;
  const seasonality = 1 + wave(index, 30, 0.12) + wave(index, 14, 0.05);
  const launchPulse = index >= 28 && index <= 42 ? 1.25 : 1;
  const promoPulse = index >= 63 && index <= 72 ? 1.18 : 1;

  const facebook = round((45 + index * 0.35 + wave(index, 11, 8)) * weekdayBoost);
  const instagram = round((70 + index * 0.55 + wave(index, 9, 13)) * launchPulse);
  const threads = round((12 + index * 0.12 + wave(index, 17, 3)) * promoPulse);
  const tiktok = round((85 + index * 0.75 + wave(index, 7, 17)) * promoPulse);

  const sales = round(
    120
    + facebook * 1.8
    + instagram * 2.6
    + threads * 0.9
    + tiktok * 3.2
    + wave(index, 21, 25)
  );

  return {
    date: date.toISOString().split('T')[0],
    facebook,
    instagram,
    threads,
    tiktok,
    sales,
  };
}

function toCsv(rows) {
  const headers = ['date', 'facebook', 'instagram', 'threads', 'tiktok', 'sales'];
  return [
    headers.join(','),
    ...rows.map(row => headers.map(header => row[header]).join(',')),
  ].join('\n') + '\n';
}

function main() {
  const rows = Array.from({ length: DAYS }, (_, index) => rowForDay(index));
  fs.mkdirSync(path.dirname(OUT_CSV), { recursive: true });
  fs.writeFileSync(OUT_CSV, toCsv(rows), 'utf8');

  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet(rows);
  sheet['!cols'] = [
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
  ];
  XLSX.utils.book_append_sheet(workbook, sheet, 'Platform Campaign');

  const meta = XLSX.utils.aoa_to_sheet([
    ['Dataset type', 'Synthetic demo data'],
    ['Purpose', 'Test Facebook/Instagram/Threads/TikTok platform ML upload flow'],
    ['Rows', rows.length],
    ['Columns', 'date, facebook, instagram, threads, tiktok, sales'],
    ['Note', 'Not a real public dataset. Do not use as business evidence.'],
  ]);
  meta['!cols'] = [{ wch: 18 }, { wch: 80 }];
  XLSX.utils.book_append_sheet(workbook, meta, 'Metadata');
  XLSX.writeFile(workbook, OUT_XLSX);

  console.log(`Wrote ${OUT_CSV}`);
  console.log(`Wrote ${OUT_XLSX}`);
}

main();
