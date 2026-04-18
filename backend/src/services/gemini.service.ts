// src/services/gemini.service.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });


// ── RATE LIMITING & RETRY LOGIC ──────────────────────────────
interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 2,  // ✅ Upgraded: can retry more on gemini-3.1-flash-lite
  initialDelayMs: 5000,   // 5 seconds (more forgiving quota now)
  maxDelayMs: 60000,      // 60 seconds max
};

// Sequential request queue - cho phép tối đa 15 requests/phút
let isProcessing = false;
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 4000; // 4 giây minimum (15 requests/phút = 60/15 = 4s)

// Timeout fallback để tránh deadlock nếu server crash giữa chừng
const PROCESSING_TIMEOUT = 180000; // 3 phút
let processingStartTime = 0;

const waitForSlot = async (): Promise<void> => {
  while (isProcessing) {
    // Nếu đang processing quá lâu → reset để tránh deadlock
    if (Date.now() - processingStartTime > PROCESSING_TIMEOUT) {
      console.warn('⚠️ Processing timeout — reset slot để tránh deadlock');
      isProcessing = false;
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Đảm bảo ít nhất 5 giây từ request trước
  const timeSinceLastRequest = Date.now() - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    console.log(`⏳ Chờ ${Math.ceil(waitTime / 1000)}s trước request tiếp theo...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  isProcessing = true;
  processingStartTime = Date.now();
};

const releaseSlot = (): void => {
  isProcessing = false;
  lastRequestTime = Date.now();
};

// ── CACHE ────────────────────────────────────────────────────
// Simple in-memory cache để tránh gọi lại cùng prompt
const responseCache = new Map<string, { result: string; timestamp: number }>();
const CACHE_TTL = 3600000; // 1 hour (can be aggressive since quota is higher)

// Request tracking for gemini-3.1-flash-lite quota
let requestCount = 0;
const DAILY_QUOTA_LIMIT = 500; // 500 requests/day
const resetTrackerAtMidnight = () => {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  tomorrow.setHours(0, 0, 0, 0);
  const timeUntilReset = tomorrow.getTime() - now.getTime();
  setTimeout(() => {
    requestCount = 0;
    console.log('📊 Daily quota tracker reset');
    resetTrackerAtMidnight();
  }, timeUntilReset);
};

if (process.env.NODE_ENV === 'production') {
  resetTrackerAtMidnight();
}

const getCacheKey = (input: string[]): string => {
  return input.join('|');
};

// BUG FIX: Parse lại JSON khi lấy từ cache thay vì trả về raw string.
// Trước đây generateHashtags nhận được string JSON thay vì string[].
const getFromCache = (key: string): any | null => {
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('✅ Sử dụng cached response');
    try {
      return JSON.parse(cached.result); // string[] hoặc object
    } catch {
      return cached.result;             // string thuần (caption, description...)
    }
  }
  responseCache.delete(key);
  return null;
};

const setCache = (key: string, result: string): void => {
  responseCache.set(key, { result, timestamp: Date.now() });
};

// Exponential backoff with aggressive delays for rate limit
const callWithRetry = async <T>(
  fn: () => Promise<T>,
  cacheKey: string | null = null,
  config: RetryConfig = defaultRetryConfig
): Promise<T> => {
  // Try cache first
  if (cacheKey) {
    const cached = getFromCache(cacheKey);
    if (cached !== null) {
      return cached as T;
    }
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      await waitForSlot();
      try {
        // Check quota before making request
        if (requestCount >= DAILY_QUOTA_LIMIT) {
          throw new Error(
            `🚫 Vượt quá quota hàng ngày (${DAILY_QUOTA_LIMIT} requests). ` +
            `Vui lòng quay lại sau ngày mai.`
          );
        }

        const result = await fn();
        requestCount++;
        console.log(`📊 Gemini API call used (${requestCount}/${DAILY_QUOTA_LIMIT})`);

        if (cacheKey) {
          setCache(cacheKey, JSON.stringify(result));
        }
        return result;
      } finally {
        releaseSlot();
      }
    } catch (error: any) {
      lastError = error;

      // 🔴 Log chi tiết error để debug
      console.error('❌ Gemini API Error:', {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        message: error?.message,
        fullError: error,
      });

      // Kiểm tra nếu là rate limit error (429)
      const isRateLimit = error?.response?.status === 429;
      const shouldRetry = attempt < config.maxRetries && isRateLimit;

      if (shouldRetry) {
        let delay = config.initialDelayMs * Math.pow(2, attempt);

        // Cố gắng lấy retry delay từ error
        if (error?.response?.data?.errors?.errorDetails) {
          const retryInfo = error.response.data.errors.errorDetails.find(
            (detail: any) => detail['@type']?.includes('RetryInfo')
          );
          if (retryInfo?.retryDelay) {
            const delaySeconds = parseInt(retryInfo.retryDelay) || 0;
            delay = (delaySeconds + 5) * 1000; // Add 5s buffer
          }
        }

        delay = Math.min(delay + Math.random() * 5000, config.maxDelayMs);

        console.warn(
          `⚠️  Quota exhausted (429). Attempt ${attempt + 1}/${config.maxRetries}. ` +
          `Chờ ${Math.ceil(delay / 1000)}s rồi thử lại...`
        );

        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // 🔴 Don't retry non-rate-limit errors on free tier
        throw error;
      }
    }
  }

  throw lastError || new Error('Vượt quá API quota');
};


// ── SINH CAPTION + HASHTAG TRONG 1 CALL (Tối ưu quota) ────────
interface CaptionWithHashtags {
  caption: string;
  hashtags: string[];
}

export const generateCaptionWithHashtags = async (
  brief: string,
  platform: 'facebook' | 'linkedin' | 'tiktok',
  tone: string = 'professional'
): Promise<CaptionWithHashtags> => {

  const platformGuide = {
    facebook: 'thân thiện, gần gũi, có thể dùng emoji, độ dài 100-200 từ',
    linkedin: 'chuyên nghiệp, nghiêm túc, không dùng nhiều emoji, độ dài 150-300 từ',
    tiktok: 'ngắn gọn, trendy, bắt trend giới trẻ, dùng emoji nhiều, dưới 100 từ',
  };

  const hashtagCount = {
    facebook: '5-10',
    linkedin: '3-5',
    tiktok: '10-15',
  };

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

      // Parse JSON an toàn
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);

      return {
        caption: parsed.caption || '',
        hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
      } as CaptionWithHashtags;
    },
    getCacheKey([brief, platform, tone])
  );
};

// ── SINH CAPTION (Legacy - sử dụng hàm kết hợp) ──────────────
export const generateCaption = async (
  brief: string,
  platform: 'facebook' | 'linkedin' | 'tiktok',
  tone: string = 'professional'
): Promise<string> => {
  const result = await generateCaptionWithHashtags(brief, platform, tone);
  return result.caption;
};

// ── GỢI Ý HASHTAG (Legacy - sử dụng hàm kết hợp) ──────────────
export const generateHashtags = async (
  content: string,
  platform: 'facebook' | 'linkedin' | 'tiktok'
): Promise<string[]> => {
  // Note: Hàm cũ nhận 'content' nhưng chúng ta cần 'brief'
  // Chỉ dùng cho backward compatibility, tốt nhất sử dụng generateCaptionWithHashtags
  const result = await generateCaptionWithHashtags(content, platform, 'professional');
  return result.hashtags;
};

// ── TẠO MÔ TẢ SẢN PHẨM ───────────────────────────────────────
export const generateProductDescription = async (
  productName: string,
  features: string,
  targetAudience: string
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
    getCacheKey([productName, features, targetAudience])
  );
};

// ── ĐỀ XUẤT CHIẾN LƯỢC NỘI DUNG ─────────────────────────────
export const generateContentStrategy = async (
  industry: string,
  topPosts: string,
  platform: string
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
    getCacheKey([industry, topPosts, platform])
  );
};

// ── CHAT VỚI AI ──────────────────────────────────────────────
export const chatWithAI = async (
  message: string,
  history?: { sender: string; text: string }[]
): Promise<string> => {

  const prompt = `
Bạn là MarketAI - Chuyên gia Marketing AI người Việt Nam. 
Nhiệm vụ của bạn là hỗ trợ người dùng về các chiến lược marketing, quảng cáo, viết bài và phân tích dữ liệu.

Lịch sử trò chuyện:
${history?.map((h) => `${h.sender === 'user' ? 'Người dùng' : 'MarketAI'}: ${h.text}`).join('\n') || '(chưa có)'}

Người dùng: ${message}

Hãy trả lời một cách chuyên nghiệp, sáng tạo và hữu ích. Nếu người dùng yêu cầu tạo content, hãy đưa ra gợi ý caption hoặc hashtag phù hợp.
  `.trim();

  return callWithRetry(
    async () => {
      const result = await model.generateContent(prompt);
      return result.response.text();
    },
    getCacheKey([message, JSON.stringify(history?.slice(-5))])
  );
};

// ── KIỂM TRA QUOTA CÒN LẠI ──────────────────────────────────
export const getQuotaStatus = () => {
  return {
    used: requestCount,
    limit: DAILY_QUOTA_LIMIT,
    remaining: Math.max(0, DAILY_QUOTA_LIMIT - requestCount),
    percentage: Math.round((requestCount / DAILY_QUOTA_LIMIT) * 100),
  };
};

// ── TEST API ──────────────────────────────────────────────────
export const testGeminiAPI = async () => {
  try {
    console.log('🧪 Testing Gemini API...');
    console.log('API Key exists:', !!process.env.GEMINI_API_KEY);
    console.log('Model name:', 'gemini-2.0-flash');

    const result = await model.generateContent('Say hello in one word');
    const response = result.response.text();

    console.log('✅ Gemini API test SUCCESS:', response);
    return { success: true, response };
  } catch (error: any) {
    console.error('❌ Gemini API test FAILED:', {
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      message: error?.message,
      data: error?.response?.data,
    });
    return { success: false, error: error?.message };
  }
};