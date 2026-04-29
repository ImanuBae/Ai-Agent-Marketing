/**
 * AI Posting-Time Optimizer
 *
 * Algorithm: Multi-Armed Bandit with Thompson Sampling
 * Each (platform, dayOfWeek, hour) is a "arm".
 * We maintain a Beta(α, β) distribution per arm.
 * At decision time we sample θ ~ Beta(α, β) for every arm and pick the highest.
 *
 * Prior (no data): α=1 β=1  (uniform)
 * Benchmark slots: α=2 β=1  (slight optimism — equivalent to one prior success)
 *
 * After each published post the caller updates the arm:
 *   α += score/10        (proportional to success intensity)
 *   β += (100-score)/10  (proportional to failure intensity)
 *
 * Engagement score formula:
 *   score = 0.4·likes + 0.3·comments + 0.2·clicks + 0.1·(clicks/impressions)·100
 *   clamped to [0, 100]
 */

import prisma from '../utils/prisma';

// ── Platform Benchmarks ──────────────────────────────────────────────────────
// Expressed in LOCAL time (what users recognise as "peak hours").
// The optimizer converts them to UTC using the caller-supplied offset.

const BENCHMARKS: Record<string, Array<{ day: number; hour: number }>> = {
  facebook: [
    { day: 1, hour: 19 }, { day: 1, hour: 20 },
    { day: 3, hour: 18 }, { day: 3, hour: 19 }, { day: 3, hour: 20 },
    { day: 5, hour: 17 }, { day: 5, hour: 18 }, { day: 5, hour: 19 },
  ],
  instagram: [
    { day: 1, hour: 11 }, { day: 1, hour: 12 }, { day: 1, hour: 19 }, { day: 1, hour: 20 },
    { day: 3, hour: 11 }, { day: 3, hour: 19 }, { day: 3, hour: 20 },
    { day: 5, hour: 11 }, { day: 5, hour: 19 },
    { day: 0, hour: 10 }, { day: 0, hour: 19 },
    { day: 6, hour: 10 }, { day: 6, hour: 20 },
  ],
  linkedin: [
    { day: 2, hour: 7 }, { day: 2, hour: 8 }, { day: 2, hour: 9 },
    { day: 3, hour: 8 }, { day: 3, hour: 12 },
    { day: 4, hour: 8 }, { day: 4, hour: 9 }, { day: 4, hour: 10 },
  ],
  tiktok: [
    { day: 2, hour: 19 }, { day: 2, hour: 20 }, { day: 2, hour: 21 },
    { day: 4, hour: 19 }, { day: 4, hour: 20 },
    { day: 6, hour: 13 }, { day: 6, hour: 19 }, { day: 6, hour: 20 },
    { day: 0, hour: 13 }, { day: 0, hour: 19 }, { day: 0, hour: 20 },
  ],
  email: [
    { day: 2, hour: 7 }, { day: 2, hour: 8 }, { day: 2, hour: 9 },
    { day: 4, hour: 8 }, { day: 4, hour: 9 }, { day: 4, hour: 10 },
  ],
};

// ── Sampling utilities ───────────────────────────────────────────────────────

// Marsaglia-Tsang gamma sampler — converges in ~1.5 iterations on average
function sampleGamma(shape: number): number {
  if (shape < 1) {
    return sampleGamma(1 + shape) * Math.pow(Math.random(), 1 / shape);
  }
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  for (;;) {
    let x: number, v: number;
    do {
      // Box-Muller normal sample
      x =
        Math.sqrt(-2 * Math.log(Math.random())) *
        Math.cos(2 * Math.PI * Math.random());
      v = 1 + c * x;
    } while (v <= 0);
    v = v ** 3;
    const u = Math.random();
    if (u < 1 - 0.0331 * x ** 4) return d * v;
    if (Math.log(u) < 0.5 * x ** 2 + d * (1 - v + Math.log(v))) return d * v;
  }
}

// Thompson sample: draw one value from Beta(α, β)
function thompsonSample(alpha: number, beta: number): number {
  const x = sampleGamma(alpha);
  const y = sampleGamma(beta);
  if (x + y === 0) return 0.5;
  return x / (x + y);
}

// ── Public API ───────────────────────────────────────────────────────────────

export function computeEngagementScore(
  likes: number,
  comments: number,
  clicks: number,
  impressions: number,
): number {
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const raw = likes * 0.4 + comments * 0.3 + clicks * 0.2 + ctr * 0.1;
  return Math.min(100, Math.max(0, Math.round(raw * 10) / 10));
}

export function getPlatformBenchmarks(
  platform: string,
): Array<{ day: number; hour: number }> {
  return BENCHMARKS[platform.toLowerCase()] ?? BENCHMARKS['instagram'];
}

export interface OptimalSlot {
  dayOfWeek: number;
  hourOfDay: number;          // UTC
  confidenceScore: number;    // 0–1 (rises as sample count grows)
  source: 'historical' | 'benchmark';
  nextDateTime: Date;         // next UTC occurrence of this slot
}

/**
 * Returns the single best available time slot for the user + platform.
 *
 * @param userTimezoneOffset  Hours ahead of UTC (e.g. 7 for Asia/Ho_Chi_Minh).
 *                            Used to convert benchmark local hours → UTC.
 * @param takenSlots          Already-scheduled times; we enforce a ≥2-hour gap.
 */
export async function getOptimalTime(
  userId: string,
  platform: string,
  userTimezoneOffset = 0,
  takenSlots: Array<{ scheduledAt: Date }> = [],
): Promise<OptimalSlot> {
  const p = platform.toLowerCase();
  const now = new Date();

  // Load existing stats for this user+platform
  const rows = await prisma.timeSlotStats.findMany({
    where: { userId, platform: p },
  });

  const hasHistoricalData = rows.some((r) => r.sampleCount >= 3);

  const statsMap = new Map<string, { alpha: number; beta: number; count: number }>();
  for (const r of rows) {
    statsMap.set(`${r.dayOfWeek}-${r.hourOfDay}`, {
      alpha: r.alphaParam,
      beta: r.betaParam,
      count: r.sampleCount,
    });
  }

  // Build benchmark set in UTC
  const benchmarkSet = new Set<string>();
  for (const b of getPlatformBenchmarks(p)) {
    const utcHour = ((b.hour - userTimezoneOffset) % 24 + 24) % 24;
    benchmarkSet.add(`${b.day}-${utcHour}`);
  }

  // Score all 168 arms via Thompson Sampling
  const candidates: Array<{ day: number; hour: number; sample: number }> = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const key = `${day}-${hour}`;
      const stat = statsMap.get(key);
      let alpha = 1.0;
      let beta = 1.0;
      if (stat) {
        alpha = stat.alpha;
        beta = stat.beta;
      } else if (benchmarkSet.has(key)) {
        alpha = 2.0; // optimistic prior for benchmark hours
      }
      candidates.push({ day, hour, sample: thompsonSample(alpha, beta) });
    }
  }

  // Sort descending by sampled value
  candidates.sort((a, b) => b.sample - a.sample);

  for (const c of candidates) {
    const next = nextUTCOccurrence(c.day, c.hour, now);

    // Must be at least 5 minutes in the future
    if (next.getTime() < now.getTime() + 5 * 60_000) continue;

    // Must have at least 2-hour gap from already-taken slots
    const tooClose = takenSlots.some(
      (s) => Math.abs(s.scheduledAt.getTime() - next.getTime()) < 2 * 3_600_000,
    );
    if (tooClose) continue;

    const stat = statsMap.get(`${c.day}-${c.hour}`);
    const confidence = Math.min(1, (stat?.count ?? 0) / 10);

    return {
      dayOfWeek: c.day,
      hourOfDay: c.hour,
      confidenceScore: confidence,
      source: hasHistoricalData ? 'historical' : 'benchmark',
      nextDateTime: next,
    };
  }

  // Last-resort fallback: first benchmark slot
  const fb = getPlatformBenchmarks(p)[0] ?? { day: 1, hour: 9 };
  const utcHour = ((fb.hour - userTimezoneOffset) % 24 + 24) % 24;
  return {
    dayOfWeek: fb.day,
    hourOfDay: utcHour,
    confidenceScore: 0,
    source: 'benchmark',
    nextDateTime: nextUTCOccurrence(fb.day, utcHour, now),
  };
}

/**
 * Updates (or creates) the Beta-distribution params for a time slot
 * after real engagement data arrives — this is the learning loop.
 */
export async function updateTimeSlotStats(
  userId: string,
  platform: string,
  dayOfWeek: number,
  hourOfDay: number,
  engagementScore: number,
): Promise<void> {
  const score = Math.max(0, Math.min(100, engagementScore));
  const p = platform.toLowerCase();
  const where = {
    userId_platform_dayOfWeek_hourOfDay: { userId, platform: p, dayOfWeek, hourOfDay },
  };

  await prisma.$transaction(async (tx) => {
    const existing = await tx.timeSlotStats.findUnique({ where });
    const sampleCount = (existing?.sampleCount ?? 0) + 1;
    const totalScore  = (existing?.totalScore  ?? 0) + score;
    const avgScore    = totalScore / sampleCount;
    const alphaParam  = (existing?.alphaParam  ?? 1.0) + score / 10;
    const betaParam   = (existing?.betaParam   ?? 1.0) + (100 - score) / 10;

    await tx.timeSlotStats.upsert({
      where,
      create: {
        userId,
        platform: p,
        dayOfWeek,
        hourOfDay,
        sampleCount: 1,
        totalScore: score,
        avgScore: score,
        alphaParam: 1.0 + score / 10,
        betaParam:  1.0 + (100 - score) / 10,
      },
      update: { sampleCount, totalScore, avgScore, alphaParam, betaParam },
    });
  });
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function nextUTCOccurrence(targetDay: number, targetHour: number, from: Date): Date {
  const d = new Date(from);
  d.setUTCMinutes(0, 0, 0);
  d.setUTCHours(targetHour);

  const daysUntil = (targetDay - d.getUTCDay() + 7) % 7;
  if (daysUntil === 0 && d.getTime() <= from.getTime()) {
    d.setUTCDate(d.getUTCDate() + 7);
  } else {
    d.setUTCDate(d.getUTCDate() + daysUntil);
  }
  return d;
}
