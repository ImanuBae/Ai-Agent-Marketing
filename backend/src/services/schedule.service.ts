import prisma from '../utils/prisma';
import { addScheduleJob, removeScheduleJob } from './queue.service';
import {
  getOptimalTime,
  updateTimeSlotStats,
  computeEngagementScore,
  getPlatformBenchmarks,
} from './optimizer.service';

const MAX_POSTS_PER_DAY = 5;
const MIN_GAP_MS = 2 * 3_600_000; // 2 hours between posts on the same platform

// ── Create ────────────────────────────────────────────────────────────────────

export async function createSchedule(
  userId: string,
  contentId: string,
  scheduledAt?: Date,
  timezone = 'UTC',
  userTimezoneOffset = 0,
) {
  const content = await prisma.content.findFirst({
    where: { id: contentId, userId },
    include: { schedule: true },
  });
  if (!content) throw new Error('Content not found');
  if (content.schedule) throw new Error('Content is already scheduled');

  // Anti-spam: daily cap per user (all platforms combined)
  const dayStart = new Date();
  dayStart.setUTCHours(0, 0, 0, 0);
  const dayEnd = new Date();
  dayEnd.setUTCHours(23, 59, 59, 999);

  const todayCount = await prisma.schedule.count({
    where: {
      userId,
      scheduledAt: { gte: dayStart, lte: dayEnd },
      status: { not: 'failed' },
    },
  });
  if (todayCount >= MAX_POSTS_PER_DAY) {
    throw new Error(`Daily post limit reached (max ${MAX_POSTS_PER_DAY})`);
  }

  // Fetch existing pending slots for the same platform (for gap enforcement)
  const takenSlots = await prisma.schedule.findMany({
    where: { userId, platform: content.platform, status: 'pending' },
    select: { scheduledAt: true },
  });

  // Check manual time doesn't conflict
  if (scheduledAt) {
    if (scheduledAt.getTime() < Date.now() + 60_000) {
      throw new Error('Scheduled time must be at least 1 minute in the future');
    }
    const tooClose = takenSlots.some(
      (s) => Math.abs(s.scheduledAt.getTime() - scheduledAt.getTime()) < MIN_GAP_MS,
    );
    if (tooClose) {
      throw new Error('Too close to an existing scheduled post (min 2-hour gap)');
    }
  }

  let finalTime: Date;
  let isOptimized = false;
  let confidenceScore: number | null = null;

  if (!scheduledAt) {
    const optimal = await getOptimalTime(
      userId,
      content.platform,
      userTimezoneOffset,
      takenSlots,
    );
    finalTime = optimal.nextDateTime;
    isOptimized = true;
    confidenceScore = optimal.confidenceScore;
  } else {
    finalTime = scheduledAt;
  }

  const schedule = await prisma.schedule.create({
    data: {
      userId,
      contentId,
      platform: content.platform,
      scheduledAt: finalTime,
      timezone,
      isOptimized,
      confidenceScore,
      status: 'pending',
    },
  });

  await prisma.content.update({
    where: { id: contentId },
    data: { status: 'scheduled' },
  });

  await addScheduleJob(schedule.id, contentId, finalTime);
  return schedule;
}

// ── Read ──────────────────────────────────────────────────────────────────────

export async function getSchedules(
  userId: string,
  filters: {
    status?: string;
    platform?: string;
    month?: number;
    year?: number;
  } = {},
) {
  const where: Record<string, unknown> = { userId };
  if (filters.status) where.status = filters.status;
  if (filters.platform) where.platform = filters.platform.toLowerCase();
  if (filters.month && filters.year) {
    const start = new Date(Date.UTC(filters.year, filters.month - 1, 1));
    const end   = new Date(Date.UTC(filters.year, filters.month, 0, 23, 59, 59, 999));
    where.scheduledAt = { gte: start, lte: end };
  }

  return prisma.schedule.findMany({
    where,
    include: {
      content: {
        select: { caption: true, hashtags: true, platform: true, status: true },
      },
    },
    orderBy: { scheduledAt: 'asc' },
  });
}

// ── Update ────────────────────────────────────────────────────────────────────

export async function updateSchedule(
  scheduleId: string,
  userId: string,
  newScheduledAt: Date,
) {
  if (newScheduledAt.getTime() < Date.now() + 60_000) {
    throw new Error('New time must be at least 1 minute in the future');
  }

  const schedule = await prisma.schedule.findFirst({
    where: { id: scheduleId, userId, status: 'pending' },
  });
  if (!schedule) throw new Error('Schedule not found or already executed');

  await removeScheduleJob(scheduleId);

  const updated = await prisma.schedule.update({
    where: { id: scheduleId },
    data: { scheduledAt: newScheduledAt, isOptimized: false, confidenceScore: null },
  });

  await addScheduleJob(scheduleId, schedule.contentId, newScheduledAt);
  return updated;
}

// ── Delete ────────────────────────────────────────────────────────────────────

export async function deleteSchedule(scheduleId: string, userId: string) {
  const schedule = await prisma.schedule.findFirst({
    where: { id: scheduleId, userId, status: 'pending' },
  });
  if (!schedule) throw new Error('Schedule not found or already executed');

  await removeScheduleJob(scheduleId);

  await prisma.content.update({
    where: { id: schedule.contentId },
    data: { status: 'draft' },
  });

  return prisma.schedule.delete({ where: { id: scheduleId } });
}

// ── Optimal-time query ────────────────────────────────────────────────────────

export async function getOptimalTimeSlots(
  userId: string,
  platform: string,
  count = 3,
  userTimezoneOffset = 0,
) {
  const p = platform.toLowerCase();
  const stats = await prisma.timeSlotStats.findMany({
    where: { userId, platform: p, sampleCount: { gte: 1 } },
    orderBy: { avgScore: 'desc' },
    take: count,
  });

  if (stats.length === 0) {
    const benchmarks = getPlatformBenchmarks(p);
    return {
      source: 'benchmark' as const,
      slots: benchmarks.slice(0, count).map((b) => {
        const utcHour = ((b.hour - userTimezoneOffset) % 24 + 24) % 24;
        return { dayOfWeek: b.day, hourOfDay: utcHour, avgScore: null, sampleCount: 0 };
      }),
    };
  }

  return {
    source: 'historical' as const,
    slots: stats.map((s) => ({
      dayOfWeek: s.dayOfWeek,
      hourOfDay: s.hourOfDay,
      avgScore: Math.round(s.avgScore * 10) / 10,
      sampleCount: s.sampleCount,
    })),
  };
}

// ── Learning loop: record real engagement ─────────────────────────────────────

export async function recordEngagement(
  userId: string,
  contentId: string,
  data: { likes: number; comments: number; clicks: number; impressions: number },
) {
  // Lookup the published schedule so we know which (day, hour) slot was used
  const schedule = await prisma.schedule.findFirst({
    where: { contentId, userId, status: 'published' },
  });
  if (!schedule) throw new Error('No published schedule found for this content');

  const score = computeEngagementScore(
    data.likes,
    data.comments,
    data.clicks,
    data.impressions,
  );

  // Persist raw engagement
  await prisma.engagementData.upsert({
    where: { contentId },
    update: { ...data, score },
    create: {
      userId,
      contentId,
      platform: schedule.platform,
      dayOfWeek: schedule.scheduledAt.getUTCDay(),
      hourOfDay: schedule.scheduledAt.getUTCHours(),
      ...data,
      score,
    },
  });

  // Feed the score back into the optimizer (learning loop)
  await updateTimeSlotStats(
    userId,
    schedule.platform,
    schedule.scheduledAt.getUTCDay(),
    schedule.scheduledAt.getUTCHours(),
    score,
  );

  return { score };
}
