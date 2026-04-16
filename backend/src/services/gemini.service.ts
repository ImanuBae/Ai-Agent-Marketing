// src/services/gemini.service.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// ── RATE LIMITING & RETRY LOGIC ──────────────────────────────
interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 2,
  initialDelayMs: 30000,  // 30 seconds (Gemini Free Tier yêu cầu)
  maxDelayMs: 120000,     // 120 seconds max
};

// Sequential request queue - chỉ 1 request tại một thời điểm
let isProcessing = false;
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 5000; // 5 giây minimum giữa requests

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
const CACHE_TTL = 3600000; // 1 hour

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
        const result = await fn();
        if (cacheKey) {
          setCache(cacheKey, JSON.stringify(result));
        }
        return result;
      } finally {
        releaseSlot();
      }
    } catch (error: any) {
      lastError = error;

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
      } else if (!isRateLimit) {
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