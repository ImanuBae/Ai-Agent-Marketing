// src/services/gemini.service.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { QuotaExhaustedError, QuotaManager } from './quota.manager';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: QuotaManager.MODEL });

// Start midnight auto-reset on module load
QuotaManager.scheduleMidnightReset();

// ── RETRY CONFIG ──────────────────────────────────────────────────────────────

interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 1,      // Only one retry for transient RPM errors
  initialDelayMs: 50_000, // 50s — Gemini typically returns 45s retryDelay
  maxDelayMs: 90_000,
};

// ── ERROR CLASSIFIERS ─────────────────────────────────────────────────────────

// Detect daily quota exhaustion from the Gemini SDK error.
// This is different from transient per-minute rate limiting.
const isQuotaExhaustedByGemini = (error: any): boolean => {
  const msg = String(error?.message ?? '').toLowerCase();
  // "QuotaExceeded" in message indicates DAILY quota (not RPM)
  return msg.includes('quotaexceeded') || msg.includes('quota_exceeded');
};

// Detect transient errors safe to retry:
//   429 — per-minute rate limit (RPM exceeded)
//   503 — Gemini server temporarily unavailable / overloaded
// Daily quota exhaustion (also 429) is explicitly excluded — never retry it.
const isTransientRateLimit = (error: any): boolean => {
  const status =
    typeof error?.status === 'number' ? error.status :
    typeof error?.response?.status === 'number' ? error.response.status : null;

  if (status !== 429 && status !== 503) return false;
  return !isQuotaExhaustedByGemini(error);
};

// ── RETRY DELAY EXTRACTION ────────────────────────────────────────────────────

// Extract retryDelay from Gemini SDK error.
// The SDK surfaces this in error.message as "retryDelay: 45s"
// or in error.errorDetails[].retryDelay
const extractRetryDelayMs = (error: any): number | null => {
  // Pattern: "retryDelay: 45s" in message
  const msgMatch = String(error?.message ?? '').match(/retryDelay[:\s]+(\d+)s/i);
  if (msgMatch) return parseInt(msgMatch[1], 10) * 1000;

  // Pattern: errorDetails array (some SDK versions)
  const details: any[] = error?.errorDetails ?? error?.response?.data?.error?.details ?? [];
  for (const d of details) {
    if (d?.retryDelay) {
      const secs = parseInt(String(d.retryDelay).replace('s', ''), 10);
      if (!isNaN(secs)) return secs * 1000;
    }
  }
  return null;
};

// ── SEQUENTIAL REQUEST SLOT (prevents RPM burst) ──────────────────────────────
// Enforces minimum 4s between requests → max 15 req/min, well under RPM limits.

let _isProcessing = false;
let _lastRequestTime = 0;
let _processingStartTime = 0;
const MIN_INTERVAL_MS = 4_000;
const DEADLOCK_TIMEOUT_MS = 180_000; // 3 min — reset stuck slot

const waitForSlot = async (): Promise<void> => {
  while (_isProcessing) {
    if (Date.now() - _processingStartTime > DEADLOCK_TIMEOUT_MS) {
      console.warn('⚠️ Request slot timeout — resetting to prevent deadlock');
      _isProcessing = false;
      break;
    }
    await new Promise(r => setTimeout(r, 300));
  }

  const elapsed = Date.now() - _lastRequestTime;
  if (elapsed < MIN_INTERVAL_MS) {
    const wait = MIN_INTERVAL_MS - elapsed;
    console.log(`⏳ Throttle: waiting ${Math.ceil(wait / 1000)}s before next request`);
    await new Promise(r => setTimeout(r, wait));
  }

  _isProcessing = true;
  _processingStartTime = Date.now();
};

const releaseSlot = (): void => {
  _isProcessing = false;
  _lastRequestTime = Date.now();
};

// ── IN-MEMORY RESPONSE CACHE ──────────────────────────────────────────────────
// Identical prompts skip the API entirely — most effective quota saver.

const _cache = new Map<string, { result: string; ts: number }>();
const CACHE_TTL_MS = 3_600_000; // 1 hour

const getCacheKey = (...parts: string[]): string => parts.join('\x00');

const getFromCache = (key: string): any | null => {
  const entry = _cache.get(key);
  if (!entry || Date.now() - entry.ts > CACHE_TTL_MS) {
    _cache.delete(key);
    return null;
  }
  console.log('✅ Cache hit — skipping API call');
  try { return JSON.parse(entry.result); } catch { return entry.result; }
};

const setCache = (key: string, value: string): void => {
  _cache.set(key, { result: value, ts: Date.now() });
};

// ── CORE RETRY WRAPPER ────────────────────────────────────────────────────────
//
// Execution order:
//   1. Check cache → return early (0 quota used)
//   2. QuotaManager.consume() → reject with 503 if daily limit reached
//   3. waitForSlot() → prevent RPM burst
//   4. Call Gemini API
//      - Success: cache result, release slot
//      - QuotaExhausted 429: rollback consume, re-throw QuotaExhaustedError
//      - Transient RPM 429: retry once with correct delay (no new consume)
//      - Other error: release slot, re-throw immediately

const callWithRetry = async <T>(
  fn: () => Promise<T>,
  cacheKey?: string,
  config: RetryConfig = defaultRetryConfig,
): Promise<T> => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Thiếu GEMINI_API_KEY trong biến môi trường');
  }

  // 1. Cache check
  if (cacheKey) {
    const cached = getFromCache(cacheKey);
    if (cached !== null) return cached as T;
  }

  // 2. Consume one quota slot — throws QuotaExhaustedError (503) if limit reached
  await QuotaManager.consume();

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    await waitForSlot();

    try {
      const result = await fn();

      if (cacheKey) setCache(cacheKey, JSON.stringify(result));
      releaseSlot();
      return result;

    } catch (error: any) {
      releaseSlot();
      lastError = error;

      // Never retry QuotaExhaustedError — slot was already rolled back by consumer
      if (error instanceof QuotaExhaustedError) throw error;

      // Daily quota exhausted from Gemini's side (edge case: our counter drifted)
      if (isQuotaExhaustedByGemini(error)) {
        await QuotaManager.rollback();
        throw new QuotaExhaustedError(
          QuotaManager.DAILY_LIMIT,
          QuotaManager.DAILY_LIMIT,
          QuotaManager.nextMidnightUTC(),
        );
      }

      // Only retry transient per-minute rate limits
      const canRetry = attempt < config.maxRetries && isTransientRateLimit(error);
      if (!canRetry) {
        // Non-rate-limit error or retries exhausted — rollback so quota isn't wasted
        await QuotaManager.rollback();
        throw error;
      }

      // 503: server overload — shorter wait (15s default)
      // 429 RPM: prefer Gemini's stated retryDelay (usually 45s), else 50s backoff
      const status =
        typeof error?.status === 'number' ? error.status :
        typeof error?.response?.status === 'number' ? error.response.status : null;

      const geminiDelay = extractRetryDelayMs(error);
      let delay: number;
      if (status === 503) {
        delay = geminiDelay ? geminiDelay + 2_000 : 15_000;
      } else {
        delay = geminiDelay
          ? geminiDelay + 3_000
          : config.initialDelayMs * Math.pow(2, attempt) + Math.random() * 2_000;
      }
      delay = Math.min(delay, config.maxDelayMs);

      const reason = status === 503 ? 'Service Unavailable' : 'RPM rate limit';
      console.warn(
        `⚠️ Transient error (${reason}, ${status}). Attempt ${attempt + 1}/${config.maxRetries}. ` +
        `Waiting ${Math.ceil(delay / 1000)}s...`,
      );
      await new Promise(r => setTimeout(r, delay));
    }
  }

  await QuotaManager.rollback();
  throw lastError ?? new Error('AI API không phản hồi');
};

// ── JSON PARSER ───────────────────────────────────────────────────────────────

const parseJsonFromAiText = (text: string): any => {
  const clean = text.replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(clean);
  } catch {
    const match = clean.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('AI trả về dữ liệu không đúng định dạng JSON');
  }
};

// ── SINH CAPTION + HASHTAG TRONG 1 CALL ──────────────────────────────────────

interface CaptionWithHashtags {
  caption: string;
  hashtags: string[];
}

export const generateCaptionWithHashtags = async (
  brief: string,
  platform: 'facebook' | 'linkedin' | 'tiktok',
  tone = 'professional',
): Promise<CaptionWithHashtags> => {
  const platformGuide = {
    facebook: 'thân thiện, gần gũi, có thể dùng emoji, độ dài 100-200 từ',
    linkedin: 'chuyên nghiệp, nghiêm túc, không dùng nhiều emoji, độ dài 150-300 từ',
    tiktok: 'ngắn gọn, trendy, bắt trend giới trẻ, dùng emoji nhiều, dưới 100 từ',
  };
  const hashtagCount = { facebook: '5-10', linkedin: '3-5', tiktok: '10-15' };

  const prompt = `
Bạn là chuyên gia marketing content người Việt Nam.
Dựa trên thông tin sản phẩm, tạo caption và gợi ý hashtag cho ${platform.toUpperCase()}.

Thông tin sản phẩm: ${brief}
Tone giọng văn: ${tone}
Yêu cầu platform: ${platformGuide[platform]}

TRƯỚC TIÊN viết caption (không giải thích thêm).
Sau đó gợi ý ${hashtagCount[platform]} hashtag phù hợp.

Trả về đúng định dạng JSON:
{
  "caption": "Nội dung caption ở đây",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"]
}

CHỈ trả JSON, không thêm bất cứ gì khác.
  `.trim();

  return callWithRetry(
    async () => {
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const parsed = parseJsonFromAiText(text);
      return {
        caption: parsed.caption ?? '',
        hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
      } as CaptionWithHashtags;
    },
    getCacheKey(brief, platform, tone),
  );
};

// ── LEGACY WRAPPERS (backward compat) ────────────────────────────────────────

export const generateCaption = async (
  brief: string,
  platform: 'facebook' | 'linkedin' | 'tiktok',
  tone = 'professional',
): Promise<string> => {
  const { caption } = await generateCaptionWithHashtags(brief, platform, tone);
  return caption;
};

export const generateHashtags = async (
  content: string,
  platform: 'facebook' | 'linkedin' | 'tiktok',
): Promise<string[]> => {
  const { hashtags } = await generateCaptionWithHashtags(content, platform, 'professional');
  return hashtags;
};

// ── TẠO MÔ TẢ SẢN PHẨM ───────────────────────────────────────────────────────

export const generateProductDescription = async (
  productName: string,
  features: string,
  targetAudience: string,
): Promise<string> => {
  const prompt = `
Bạn là chuyên gia viết mô tả sản phẩm người Việt Nam.
Viết mô tả sản phẩm hấp dẫn, thuyết phục cho:

Tên sản phẩm: ${productName}
Tính năng nổi bật: ${features}
Đối tượng khách hàng: ${targetAudience}

Yêu cầu:
- Độ dài 100-200 từ
- Nhấn mạnh lợi ích cho người dùng
- Có call-to-action ở cuối
- Chỉ trả về nội dung mô tả, không giải thích thêm
  `.trim();

  return callWithRetry(
    async () => {
      const result = await model.generateContent(prompt);
      return result.response.text();
    },
    getCacheKey(productName, features, targetAudience),
  );
};

// ── ĐỀ XUẤT CHIẾN LƯỢC NỘI DUNG ──────────────────────────────────────────────

export const generateContentStrategy = async (
  industry: string,
  topPosts: string,
  platform: string,
): Promise<string> => {
  const prompt = `
Bạn là chuyên gia marketing strategy người Việt Nam.
Dựa trên dữ liệu hiệu quả bài đăng của doanh nghiệp trong ngành ${industry}:

Các bài đăng hiệu quả nhất: ${topPosts}
Nền tảng: ${platform}

Hãy đề xuất chiến lược nội dung bao gồm:
1. Loại nội dung nên tập trung
2. Khung giờ đăng tốt nhất
3. Tần suất đăng bài hợp lý
4. Chủ đề nội dung gợi ý cho 1 tuần tới

Trả lời bằng tiếng Việt, ngắn gọn và thực tế.
  `.trim();

  return callWithRetry(
    async () => {
      const result = await model.generateContent(prompt);
      return result.response.text();
    },
    getCacheKey(industry, topPosts, platform),
  );
};

// ── CHAT VỚI AI ───────────────────────────────────────────────────────────────
// Chat uses last 5 history entries only — avoids huge prompts that waste tokens.

export const chatWithAI = async (
  message: string,
  history?: { sender: string; text: string }[],
): Promise<string> => {
  const recentHistory = history?.slice(-5) ?? [];

  const prompt = `
Bạn là MarketAI - Chuyên gia Marketing AI người Việt Nam.
Nhiệm vụ của bạn là hỗ trợ người dùng về các chiến lược marketing, quảng cáo, viết bài và phân tích dữ liệu.

Lịch sử trò chuyện:
${recentHistory.map(h => `${h.sender === 'user' ? 'Người dùng' : 'MarketAI'}: ${h.text}`).join('\n') || '(chưa có)'}

Người dùng: ${message}

Hãy trả lời một cách chuyên nghiệp, sáng tạo và hữu ích.
  `.trim();

  // Chat responses are not cached (each message is unique by nature)
  return callWithRetry(async () => {
    const result = await model.generateContent(prompt);
    return result.response.text();
  });
};

// ── QUOTA STATUS ──────────────────────────────────────────────────────────────

export const getQuotaStatus = async () => {
  const status = await QuotaManager.peek();
  return {
    used: status.used,
    limit: status.limit,
    remaining: status.remaining,
    percentage: Math.round((status.used / status.limit) * 100),
    resetAt: status.resetAt.toISOString(),
  };
};

// ── TEST API ──────────────────────────────────────────────────────────────────
// Bypasses quota management — only call manually during debugging.

export const testGeminiAPI = async () => {
  try {
    console.log('🧪 Testing Gemini API directly (quota not tracked)...');
    const result = await model.generateContent('Say hello in one word');
    const response = result.response.text();
    console.log('✅ Gemini API test SUCCESS:', response);
    return { success: true, response };
  } catch (error: any) {
    console.error('❌ Gemini API test FAILED:', error?.message);
    return { success: false, error: error?.message };
  }
};
