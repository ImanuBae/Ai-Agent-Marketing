import crypto from 'crypto';
import redis from './redis';

// ─── Encryption ───────────────────────────────────────────────────────────────
// Key is derived from JWT_SECRET — no separate env var needed.

const encryptionKey = crypto.scryptSync(
  process.env.JWT_SECRET ?? 'fallback-please-set-jwt-secret',
  'oauth-encryption-salt-v1',
  32,
);

const ALGORITHM = 'aes-256-gcm';

export const encrypt = (plaintext: string): string => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, encrypted].map((b) => b.toString('base64')).join('.');
};

export const decrypt = (ciphertext: string): string => {
  const parts = ciphertext.split('.');
  if (parts.length !== 3) throw new Error('Invalid ciphertext format');
  const [ivB64, tagB64, encB64] = parts;
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const encrypted = Buffer.from(encB64, 'base64');
  const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, iv);
  decipher.setAuthTag(tag);
  return decipher.update(encrypted).toString('utf8') + decipher.final('utf8');
};

// ─── OAuth State (CSRF protection) ───────────────────────────────────────────
// State maps: random_hex → userId, TTL 5 minutes, single-use.

const STATE_TTL = 300; // seconds
const STATE_PREFIX = 'oauth_state:';

// In-memory fallback when Redis is not configured (single-process only)
const memStore = new Map<string, { userId: string; exp: number }>();

export const generateState = async (userId: string): Promise<string> => {
  const state = crypto.randomBytes(32).toString('hex');

  if (redis) {
    await redis.set(`${STATE_PREFIX}${state}`, userId, 'EX', STATE_TTL);
  } else {
    memStore.set(state, { userId, exp: Date.now() + STATE_TTL * 1000 });
    setTimeout(() => memStore.delete(state), STATE_TTL * 1000);
  }

  return state;
};

// Returns the userId bound to the state, or null if invalid/expired.
// State is consumed (deleted) on first use.
export const validateState = async (state: string): Promise<string | null> => {
  if (redis) {
    const userId = await redis.get(`${STATE_PREFIX}${state}`);
    if (userId) await redis.del(`${STATE_PREFIX}${state}`);
    return userId ?? null;
  }

  const entry = memStore.get(state);
  memStore.delete(state);
  if (!entry || Date.now() > entry.exp) return null;
  return entry.userId;
};

// ─── URL helpers ──────────────────────────────────────────────────────────────

export const getCallbackUrl = (platform: string): string => {
  const base = process.env.BACKEND_URL ?? `http://localhost:${process.env.PORT ?? 5000}`;
  return `${base}/api/social/callback/${platform}`;
};

export const getFrontendRedirectUrl = (
  platform: string,
  success: boolean,
  errorMsg?: string,
): string => {
  const base = process.env.CLIENT_URL ?? 'http://localhost:3000';
  const qs = success
    ? `connected=${platform}&success=true`
    : `error=${encodeURIComponent(errorMsg ?? 'OAuth thất bại')}`;
  return `${base}/dashboard/social?${qs}`;
};
