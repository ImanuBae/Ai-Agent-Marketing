import { Queue, Worker, Job } from 'bullmq';
import prisma from '../utils/prisma';

const REDIS_URL = process.env.REDIS_URL ?? '';
const isRedisConfigured =
  REDIS_URL.startsWith('redis://') || REDIS_URL.startsWith('rediss://');

let scheduleQueue: Queue | null = null;

if (isRedisConfigured) {
  const connection = {
    url: REDIS_URL,
    maxRetriesPerRequest: null,   // required by BullMQ
    enableOfflineQueue: false,    // fail fast when Redis is down
    connectTimeout: 5000,
    lazyConnect: true,
  };

  scheduleQueue = new Queue('schedule-posts', { connection });

  new Worker(
    'schedule-posts',
    async (job: Job) => {
      const { scheduleId, contentId } = job.data as {
        scheduleId: string;
        contentId: string;
      };

      // 1. Mark as published in DB
      await prisma.$transaction([
        prisma.schedule.update({
          where: { id: scheduleId },
          data: { status: 'published' },
        }),
        prisma.content.update({
          where: { id: contentId },
          data: { status: 'published' },
        }),
      ]);

      // 2. TODO Part 9: call real social API here
      console.log(`[Queue] Published content ${contentId} (schedule ${scheduleId})`);

      // 3. Seed an empty EngagementData row so Part 9 can PATCH it with real metrics
      const schedule = await prisma.schedule.findUnique({
        where: { id: scheduleId },
      });
      if (schedule) {
        await prisma.engagementData.upsert({
          where: { contentId },
          create: {
            userId: schedule.userId,
            contentId,
            platform: schedule.platform,
            dayOfWeek: schedule.scheduledAt.getUTCDay(),
            hourOfDay: schedule.scheduledAt.getUTCHours(),
          },
          update: {},
        });
      }
    },
    {
      connection,
      // retry once on transient failure
      settings: { backoffStrategy: () => 5_000 },
    },
  );

  // Surface worker errors without crashing the process
  console.log('✅  BullMQ schedule queue initialized');
} else {
  console.warn('⚠️   REDIS_URL not configured — schedule queue disabled (jobs will not auto-publish)');
}

export async function addScheduleJob(
  scheduleId: string,
  contentId: string,
  scheduledAt: Date,
): Promise<void> {
  if (!scheduleQueue) {
    console.warn('[Queue] Skipped: Redis not configured');
    return;
  }
  const delay = Math.max(0, scheduledAt.getTime() - Date.now());
  await scheduleQueue.add(
    'publish-content',
    { scheduleId, contentId },
    {
      delay,
      jobId: scheduleId,       // idempotent re-adds
      removeOnComplete: 100,
      removeOnFail: 50,
    },
  );
}

export async function removeScheduleJob(scheduleId: string): Promise<void> {
  if (!scheduleQueue) return;
  const job = await scheduleQueue.getJob(scheduleId);
  if (job) await job.remove();
}

export { scheduleQueue };
