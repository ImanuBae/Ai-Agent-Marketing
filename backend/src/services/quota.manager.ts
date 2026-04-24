// Manages Gemini API daily quota with PostgreSQL persistence.
// In-memory counter acts as fast path; DB is source of truth across restarts.
// Design: consume() ONLY throws QuotaExhaustedError — never Prisma/DB errors.
// If DB is unavailable, falls back to in-memory tracking so AI features stay alive.

import prisma from '../utils/prisma';

// ── Custom error thrown when daily quota is exhausted ─────────────────────────
export class QuotaExhaustedError extends Error {
  readonly httpStatus = 503;
  readonly name = 'QuotaExhaustedError';

  constructor(
    public readonly used: number,
    public readonly limit: number,
    public readonly resetAt: Date,
  ) {
    const resetStr = resetAt.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    super(
      `Quota AI hàng ngày đã hết (${used}/${limit} requests). ` +
      `Hệ thống sẽ tự reset lúc ${resetStr} (nửa đêm UTC).`,
    );
  }
}

export interface QuotaStatus {
  used: number;
  limit: number;
  remaining: number;
  resetAt: Date;
}

// ── QuotaManager ──────────────────────────────────────────────────────────────
export class QuotaManager {
  static readonly DAILY_LIMIT = parseInt(process.env.GEMINI_DAILY_LIMIT ?? '18', 10);
  static readonly MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';

  private static _memCount = 0;
  private static _dateKey = '';
  private static _synced = false;
  private static _resetTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Helpers ────────────────────────────────────────────────────────────────

  static todayKey(): string {
    return new Date().toISOString().slice(0, 10); // UTC "YYYY-MM-DD"
  }

  static nextMidnightUTC(): Date {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + 1);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }

  // ── Sync from DB (called on first request / after server restart) ──────────

  static async sync(): Promise<void> {
    const today = this.todayKey();
    if (this._synced && this._dateKey === today) return;

    try {
      const record = await prisma.dailyApiQuota.findUnique({
        where: { dateKey_model: { dateKey: today, model: this.MODEL } },
      });
      this._memCount = record?.requestCount ?? 0;
      this._dateKey = today;
      this._synced = true;
      console.log(`📊 QuotaManager synced: ${this._memCount}/${this.DAILY_LIMIT} used today`);
    } catch (err) {
      // DB unavailable or Prisma client outdated — keep in-memory count, mark as synced
      // to avoid hammering DB on every request. Will retry next restart.
      this._dateKey = today;
      this._synced = true;
      console.error('⚠️ QuotaManager: DB sync failed, using in-memory count:', (err as Error).message);
    }
  }

  // ── Schedule auto-reset at UTC midnight ────────────────────────────────────

  static scheduleMidnightReset(): void {
    if (this._resetTimer) clearTimeout(this._resetTimer);

    const msUntilMidnight = this.nextMidnightUTC().getTime() - Date.now();

    this._resetTimer = setTimeout(() => {
      this._synced = false;
      this._dateKey = '';
      console.log('🔄 QuotaManager: midnight reset — will re-sync from DB on next AI call');
      this.scheduleMidnightReset();
    }, msUntilMidnight);
  }

  // ── Peek (read-only, no side effects) ─────────────────────────────────────

  static async peek(): Promise<QuotaStatus> {
    await this.sync();
    return {
      used: this._memCount,
      limit: this.DAILY_LIMIT,
      remaining: Math.max(0, this.DAILY_LIMIT - this._memCount),
      resetAt: this.nextMidnightUTC(),
    };
  }

  // ── Consume (check + increment atomically) ────────────────────────────────
  //
  // CONTRACT: This method ONLY throws QuotaExhaustedError.
  //           All Prisma/DB errors are caught and handled internally.
  //           If DB is down, falls back to in-memory tracking.
  //
  // This contract ensures callWithRetry never sees unexpected errors from
  // quota management, which could block AI features unrelated to quota.

  static async consume(): Promise<QuotaStatus> {
    await this.sync();

    // Fast-path: reject immediately without hitting DB
    if (this._memCount >= this.DAILY_LIMIT) {
      throw new QuotaExhaustedError(this._memCount, this.DAILY_LIMIT, this.nextMidnightUTC());
    }

    const today = this.todayKey();

    try {
      const record = await prisma.dailyApiQuota.upsert({
        where: { dateKey_model: { dateKey: today, model: this.MODEL } },
        update: { requestCount: { increment: 1 } },
        create: { dateKey: today, model: this.MODEL, requestCount: 1 },
      });

      // Double-check: guard against concurrent requests exceeding limit together
      if (record.requestCount > this.DAILY_LIMIT) {
        // Best-effort rollback — if it fails, the DB count drifts by 1 (acceptable)
        prisma.dailyApiQuota
          .update({
            where: { dateKey_model: { dateKey: today, model: this.MODEL } },
            data: { requestCount: { decrement: 1 } },
          })
          .catch(() => {});
        this._memCount = this.DAILY_LIMIT;
        throw new QuotaExhaustedError(this.DAILY_LIMIT, this.DAILY_LIMIT, this.nextMidnightUTC());
      }

      this._memCount = record.requestCount;

    } catch (err) {
      // Re-throw QuotaExhaustedError — it's intentional, not a DB error
      if (err instanceof QuotaExhaustedError) throw err;

      // DB/Prisma error (old DLL, connection down, etc.)
      // Fall back: track in-memory only. Feature continues working, quota is approximate.
      this._memCount++;
      console.error(
        `⚠️ QuotaManager: DB persist failed (in-memory fallback, count=${this._memCount}):`,
        (err as Error).message,
      );
    }

    const status: QuotaStatus = {
      used: this._memCount,
      limit: this.DAILY_LIMIT,
      remaining: this.DAILY_LIMIT - this._memCount,
      resetAt: this.nextMidnightUTC(),
    };

    if (status.remaining <= 3) {
      console.warn(`🔴 QuotaManager: CRITICAL — only ${status.remaining} requests left today!`);
    } else {
      const pct = Math.round((status.used / status.limit) * 100);
      console.log(`📊 QuotaManager: ${status.used}/${status.limit} (${pct}%)`);
    }

    return status;
  }

  // ── Roll back last consume (called when API call ultimately fails) ─────────
  //
  // FIX: Decrement in-memory FIRST, then attempt DB.
  // Old code decremented memory inside the try block — if DB failed, memory
  // stayed inflated permanently for the session.

  static async rollback(): Promise<void> {
    if (this._memCount <= 0) return;

    // Always decrement in-memory immediately (regardless of DB outcome)
    this._memCount = Math.max(0, this._memCount - 1);

    const today = this.todayKey();
    try {
      await prisma.dailyApiQuota.update({
        where: { dateKey_model: { dateKey: today, model: this.MODEL } },
        data: { requestCount: { decrement: 1 } },
      });
      console.log(`↩️ QuotaManager: rolled back one slot (now ${this._memCount}/${this.DAILY_LIMIT})`);
    } catch (err) {
      // DB rollback failed — in-memory already decremented above, so no drift in this session.
      // DB will be corrected on next server restart via sync().
      console.error('⚠️ QuotaManager: DB rollback failed (in-memory ok):', (err as Error).message);
    }
  }
}
