import axios from 'axios';
import prisma from '../utils/prisma';
import { decrypt } from '../utils/oauth';
import type { Schedule, Content } from '@prisma/client';

const FB_VERSION = 'v21.0';
const POLL_INTERVAL_MS = 60_000;

type ScheduleWithContent = Schedule & { content: Content };

function decryptSocialToken(encryptedToken: string, platform: string): string {
  try {
    return decrypt(encryptedToken);
  } catch {
    throw new Error(
      `Không giải mã được token ${platform}. JWT_SECRET/OAUTH secret trên server có thể đã thay đổi; hãy đặt secret cố định trên deploy rồi kết nối lại ${platform}.`,
    );
  }
}

// ─── Facebook ─────────────────────────────────────────────────────────────────

async function publishToFacebook(schedule: ScheduleWithContent): Promise<void> {
  const account = await prisma.socialAccount.findUnique({
    where: { userId_platform: { userId: schedule.userId, platform: 'facebook' } },
  });
  if (!account) throw new Error('Facebook chưa kết nối');

  if (account.expiresAt && account.expiresAt < new Date()) {
    throw new Error('Token Facebook đã hết hạn (>60 ngày). Vui lòng ngắt kết nối và kết nối lại.');
  }

  const userToken = decryptSocialToken(account.accessToken, 'Facebook');

  let pages: Array<{ id: string; access_token: string; name: string }>;
  try {
    const { data } = await axios.get(`https://graph.facebook.com/${FB_VERSION}/me/accounts`, {
      params: { access_token: userToken },
    });
    pages = data.data ?? [];
  } catch (err: any) {
    const fbCode = err?.response?.data?.error?.code;
    if (fbCode === 190) {
      throw new Error('Token Facebook đã hết hạn hoặc bị thu hồi. Vui lòng kết nối lại.');
    }
    throw err;
  }

  // Fallback: pages managed via Meta Business Portfolio won't appear in /me/accounts
  if (pages.length === 0) {
    try {
      const { data: bizData } = await axios.get(
        `https://graph.facebook.com/${FB_VERSION}/me/businesses`,
        { params: { access_token: userToken, fields: 'owned_pages.fields(id,access_token,name)' } },
      );
      pages = (bizData.data ?? []).flatMap((biz: any) => biz.owned_pages?.data ?? []);
    } catch {
      // business_management not in token scope yet → user needs to reconnect
    }
  }

  if (pages.length === 0) {
    throw new Error(
      'Không tìm thấy Facebook Page. Token thiếu quyền business_management — vui lòng ngắt kết nối Facebook và kết nối lại.',
    );
  }

  const message = [schedule.content.caption, schedule.content.hashtags.join(' ')]
    .filter(Boolean)
    .join('\n\n');

  await axios.post(`https://graph.facebook.com/${FB_VERSION}/${pages[0].id}/feed`, null, {
    params: { message, access_token: pages[0].access_token },
  });
}

// ─── Instagram ────────────────────────────────────────────────────────────────

async function publishToInstagram(schedule: ScheduleWithContent): Promise<void> {
  const account = await prisma.socialAccount.findUnique({
    where: { userId_platform: { userId: schedule.userId, platform: 'instagram' } },
  });
  if (!account) throw new Error('Instagram chưa kết nối');

  if (!schedule.content.imageUrl) {
    throw new Error('Instagram cần image URL. Hãy thêm ảnh vào bài đăng trước khi lên lịch.');
  }

  const accessToken = decryptSocialToken(account.accessToken, 'Instagram');
  const igUserId = account.accountId;

  const caption = [schedule.content.caption, schedule.content.hashtags.join(' ')]
    .filter(Boolean)
    .join('\n\n');

  // Step 1: tạo media container
  const { data: container } = await axios.post(
    `https://graph.instagram.com/${igUserId}/media`,
    null,
    {
      params: {
        image_url: schedule.content.imageUrl,
        caption,
        access_token: accessToken,
      },
    },
  );

  // Step 2: publish
  await axios.post(`https://graph.instagram.com/${igUserId}/media_publish`, null, {
    params: {
      creation_id: container.id,
      access_token: accessToken,
    },
  });
}

// ─── Core publish + DB update ─────────────────────────────────────────────────

async function publishSchedule(schedule: ScheduleWithContent): Promise<void> {
  if (schedule.platform === 'facebook') {
    await publishToFacebook(schedule);
  } else if (schedule.platform === 'instagram') {
    await publishToInstagram(schedule);
  } else {
    throw new Error(`Platform chưa hỗ trợ đăng tự động: ${schedule.platform}`);
  }

  await prisma.$transaction([
    prisma.schedule.update({
      where: { id: schedule.id },
      data: { status: 'published' },
    }),
    prisma.content.update({
      where: { id: schedule.contentId },
      data: { status: 'published' },
    }),
  ]);

  await prisma.engagementData.upsert({
    where: { contentId: schedule.contentId },
    create: {
      userId: schedule.userId,
      contentId: schedule.contentId,
      platform: schedule.platform,
      dayOfWeek: schedule.scheduledAt.getUTCDay(),
      hourOfDay: schedule.scheduledAt.getUTCHours(),
    },
    update: {},
  });
}

// ─── Polling loop ─────────────────────────────────────────────────────────────

async function processDueSchedules(): Promise<void> {
  const due = await prisma.schedule.findMany({
    where: { status: 'pending', scheduledAt: { lte: new Date() } },
    include: { content: true },
  });

  for (const schedule of due) {
    try {
      await publishSchedule(schedule);
      console.log(`[Queue] Published ${schedule.platform} post (schedule ${schedule.id})`);
    } catch (err: any) {
      const errorMsg = err?.response?.data
        ? JSON.stringify(err.response.data)
        : (err?.message ?? 'Unknown error');
      console.error(`[Queue] Failed schedule ${schedule.id}:`, errorMsg);
      await prisma.schedule.update({
        where: { id: schedule.id },
        data: { status: 'failed', errorMsg },
      });
      await prisma.content.update({
        where: { id: schedule.contentId },
        data: { status: 'draft' },
      });
    }
  }
}

// Poll mỗi 60s; chạy ngay khi khởi động để bắt các schedule bị bỏ lỡ
setInterval(() => {
  processDueSchedules().catch((err) => console.error('[Queue] Poll error:', err));
}, POLL_INTERVAL_MS);

processDueSchedules().catch((err) => console.error('[Queue] Startup poll error:', err));

console.log('✅  Schedule poller started (interval: 60s)');

// Stub exports — schedule.service.ts vẫn gọi nhưng polling tự xử lý
export async function addScheduleJob(_scheduleId: string, _contentId: string, _scheduledAt: Date): Promise<void> {}
export async function removeScheduleJob(_scheduleId: string): Promise<void> {}
export const scheduleQueue = null;
