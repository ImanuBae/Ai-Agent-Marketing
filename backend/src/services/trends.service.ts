// src/services/trends.service.ts
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ── TYPES ─────────────────────────────────────────────────────────────────────

export interface TrendKeyword {
  id: number;
  keyword: string;
  volume: string;
  change: string;
  status: 'up' | 'down';
  sparkline: string;
}

export interface TrendComparison {
  keyword: string;
  average: number;
  sparkline: string;
  data: { time: string; value: number }[];
}

export interface TrendIdea {
  id: number;
  title: string;
  match: string;
  tag: string;
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function makeSparkline(values: number[]): string {
  if (values.length < 2) return 'M0,20 L100,20';
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) => {
    const x = ((i / (values.length - 1)) * 100).toFixed(1);
    const y = (40 - (v / max) * 35).toFixed(1);
    return `${x},${y}`;
  });
  return `M${pts.join(' L')}`;
}

function simpleUpSparkline(): string {
  return 'M0,35 Q25,28 50,18 T100,5';
}

// Parses Google Trends RSS XML — no extra dependency needed
function parseRSS(xml: string): { title: string; traffic: string }[] {
  const items: { title: string; traffic: string }[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const titleMatch = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ?? block.match(/<title>(.*?)<\/title>/);
    const trafficMatch = block.match(/<ht:approx_traffic>(.*?)<\/ht:approx_traffic>/);
    if (titleMatch?.[1]) {
      items.push({ title: titleMatch[1], traffic: trafficMatch?.[1] ?? 'N/A' });
    }
  }
  return items;
}

// ── KEYWORDS (daily trending via Google Trends RSS) ───────────────────────────

export const fetchDailyTrends = async (geo = 'VN'): Promise<TrendKeyword[]> => {
  const response = await axios.get(
    `https://trends.google.com/trending/rss?geo=${geo}`,
    { headers: { 'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8' }, timeout: 10000 },
  );
  const items = parseRSS(response.data as string);

  return items.slice(0, 10).map((item, idx: number) => ({
    id: idx + 1,
    keyword: item.title,
    volume: item.traffic,
    change: '+trending',
    status: 'up' as const,
    sparkline: simpleUpSparkline(),
  }));
};

// ── COMPARE (interest over time for 2–5 keywords) ────────────────────────────

export const compareKeywords = async (keywords: string[], geo = 'VN'): Promise<TrendComparison[]> => {
  const endTime = new Date();
  const startTime = new Date();
  startTime.setDate(startTime.getDate() - 30);

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const googleTrends = require('google-trends-api');
  const raw = await googleTrends.interestOverTime({ keyword: keywords, geo, startTime, endTime });
  const data = JSON.parse(raw);
  const timelineData: any[] = data?.default?.timelineData ?? [];
  const averages: number[] = data?.default?.averages ?? keywords.map(() => 0);

  return keywords.map((kw, kwIdx) => {
    const values: number[] = timelineData.map((pt: any) => pt.value?.[kwIdx] ?? 0);
    return {
      keyword: kw,
      average: averages[kwIdx] ?? 0,
      sparkline: makeSparkline(values),
      data: timelineData.map((pt: any) => ({
        time: pt.formattedAxisTime ?? pt.formattedTime ?? '',
        value: pt.value?.[kwIdx] ?? 0,
      })),
    };
  });
};

// ── YOUTUBE (most popular videos) ────────────────────────────────────────────

export const fetchYouTubeTrends = async (regionCode = 'VN') => {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    const err = new Error('YouTube API key chưa được cấu hình') as any;
    err.code = 'NO_API_KEY';
    throw err;
  }

  const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
    params: { part: 'snippet,statistics', chart: 'mostPopular', regionCode, maxResults: 10, key },
  });

  return response.data.items.map((item: any, idx: number) => ({
    id: idx + 1,
    videoId: item.id,
    title: item.snippet?.title ?? '',
    channel: item.snippet?.channelTitle ?? '',
    thumbnail: item.snippet?.thumbnails?.medium?.url ?? '',
    viewCount: Number(item.statistics?.viewCount ?? 0).toLocaleString('vi-VN'),
    publishedAt: item.snippet?.publishedAt ?? '',
  }));
};

// ── SUGGEST (AI content ideas from trending keywords) ────────────────────────

export const suggestTopics = async (keywords: string[]): Promise<TrendIdea[]> => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `Bạn là chuyên gia marketing content tại Việt Nam.
Dựa trên các từ khóa đang trending: ${keywords.join(', ')}
Hãy gợi ý 5 ý tưởng bài viết hấp dẫn cho mạng xã hội.

Trả về JSON array, KHÔNG có markdown hay code block:
[{"title":"tiêu đề bài viết","match":"85%","tag":"từ khóa liên quan"},...]`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  let parsed: any[] = [];
  try {
    parsed = JSON.parse(text);
  } catch {
    const match = text.match(/\[[\s\S]*\]/);
    if (match) parsed = JSON.parse(match[0]);
  }

  return parsed.slice(0, 5).map((item: any, idx: number) => ({
    id: idx + 1,
    title: item.title ?? '',
    match: item.match ?? '80%',
    tag: item.tag ?? keywords[0] ?? '',
  }));
};
