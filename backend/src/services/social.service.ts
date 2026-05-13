import axios from 'axios';
import prisma from '../utils/prisma';
import { encrypt, decrypt, generateState, validateState, getCallbackUrl } from '../utils/oauth';
import type { SocialPlatform, SocialProfile, OAuthTokens } from '../types/social';

// ─── Facebook ─────────────────────────────────────────────────────────────────

const FB_VERSION = 'v19.0';
const FB_AUTH_BASE = `https://www.facebook.com/${FB_VERSION}/dialog/oauth`;
const FB_TOKEN_URL = `https://graph.facebook.com/${FB_VERSION}/oauth/access_token`;
const FB_GRAPH_ME = `https://graph.facebook.com/${FB_VERSION}/me`;

export const getFacebookAuthUrl = async (userId: string): Promise<string> => {
  const state = await generateState(userId);
  const params = new URLSearchParams({
    client_id: process.env.FACEBOOK_CLIENT_ID!,
    redirect_uri: getCallbackUrl('facebook'),
    scope: 'public_profile,email',
    state,
    response_type: 'code',
  });
  return `${FB_AUTH_BASE}?${params}`;
};

const exchangeFacebookCode = async (code: string): Promise<OAuthTokens> => {
  // Step 1: short-lived token
  const { data: shortToken } = await axios.get<{ access_token: string }>(FB_TOKEN_URL, {
    params: {
      client_id: process.env.FACEBOOK_CLIENT_ID,
      client_secret: process.env.FACEBOOK_CLIENT_SECRET,
      redirect_uri: getCallbackUrl('facebook'),
      code,
    },
  });

  // Step 2: exchange for long-lived token (~60 days)
  const { data: longToken } = await axios.get<{
    access_token: string;
    expires_in?: number;
  }>(FB_TOKEN_URL, {
    params: {
      grant_type: 'fb_exchange_token',
      client_id: process.env.FACEBOOK_CLIENT_ID,
      client_secret: process.env.FACEBOOK_CLIENT_SECRET,
      fb_exchange_token: shortToken.access_token,
    },
  });

  return { accessToken: longToken.access_token, expiresIn: longToken.expires_in };
};

const getFacebookProfile = async (accessToken: string): Promise<SocialProfile> => {
  const { data } = await axios.get<{
    id: string;
    name: string;
    picture?: { data: { url: string } };
  }>(FB_GRAPH_ME, {
    params: { fields: 'id,name,picture.type(large)', access_token: accessToken },
  });

  return {
    platformId: data.id,
    name: data.name,
    avatarUrl: data.picture?.data?.url,
  };
};

// ─── Instagram ────────────────────────────────────────────────────────────────

const IG_AUTH_BASE = 'https://www.instagram.com/oauth/authorize';
const IG_TOKEN_URL = 'https://api.instagram.com/oauth/access_token';
const IG_LONGTOKEN_URL = 'https://graph.instagram.com/access_token';
const IG_GRAPH_ME = 'https://graph.instagram.com/me';

export const getInstagramAuthUrl = async (userId: string): Promise<string> => {
  const state = await generateState(userId);
  const redirectUri = getCallbackUrl('instagram');
  // Use force_reauth=true to match the Business Login flow where redirect_uri is registered
  const params = new URLSearchParams({
    force_reauth: 'true',
    client_id: process.env.INSTAGRAM_CLIENT_ID!,
    redirect_uri: redirectUri,
    scope: 'instagram_business_basic',
    state,
    response_type: 'code',
  });
  console.log('[Instagram] Auth URL redirect_uri:', redirectUri);
  return `${IG_AUTH_BASE}?${params}`;
};

const exchangeInstagramCode = async (code: string): Promise<OAuthTokens> => {
  const redirectUri = getCallbackUrl('instagram');
  const body = new URLSearchParams({
    client_id: process.env.INSTAGRAM_CLIENT_ID!,
    client_secret: process.env.INSTAGRAM_CLIENT_SECRET!,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
    code,
  });

  console.log('[Instagram] Exchanging code, redirect_uri:', redirectUri);

  let shortToken: { access_token: string; user_id: number };
  try {
    const res = await axios.post<{ access_token: string; user_id: number }>(
      IG_TOKEN_URL,
      body.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );
    shortToken = res.data;
  } catch (err: any) {
    const detail = err?.response?.data ?? err?.message;
    console.error('[Instagram] Short-lived token exchange failed:', JSON.stringify(detail));
    throw new Error(`Instagram token exchange failed: ${JSON.stringify(detail)}`);
  }

  let longToken: { access_token: string; expires_in: number };
  try {
    const res = await axios.get<{ access_token: string; expires_in: number }>(
      IG_LONGTOKEN_URL,
      {
        params: {
          grant_type: 'ig_exchange_token',
          client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
          access_token: shortToken.access_token,
        },
      },
    );
    longToken = res.data;
  } catch (err: any) {
    const detail = err?.response?.data ?? err?.message;
    console.error('[Instagram] Long-lived token exchange failed:', JSON.stringify(detail));
    throw new Error(`Instagram long-lived token failed: ${JSON.stringify(detail)}`);
  }

  return { accessToken: longToken.access_token, expiresIn: longToken.expires_in };
};

const getInstagramProfile = async (accessToken: string): Promise<SocialProfile> => {
  const { data } = await axios.get<{
    id: string;
    name?: string;
    username?: string;
    profile_picture_url?: string;
  }>(IG_GRAPH_ME, {
    params: {
      fields: 'id,name,username,profile_picture_url',
      access_token: accessToken,
    },
  });

  return {
    platformId: data.id,
    name: data.name ?? data.username ?? 'Instagram Account',
    avatarUrl: data.profile_picture_url,
  };
};

// ─── Threads ──────────────────────────────────────────────────────────────────

const TH_AUTH_BASE = 'https://threads.net/oauth/authorize';
const TH_TOKEN_URL = 'https://graph.threads.net/oauth/access_token';
const TH_LONGTOKEN_URL = 'https://graph.threads.net/access_token';
const TH_GRAPH_ME = 'https://graph.threads.net/v1.0/me';

export const getThreadsAuthUrl = async (userId: string): Promise<string> => {
  const state = await generateState(userId);
  const params = new URLSearchParams({
    client_id: process.env.THREADS_CLIENT_ID!,
    redirect_uri: getCallbackUrl('threads'),
    scope: 'threads_basic,threads_content_publish',
    response_type: 'code',
    state,
  });
  return `${TH_AUTH_BASE}?${params}`;
};

const exchangeThreadsCode = async (code: string): Promise<OAuthTokens> => {
  // Step 1: short-lived token
  const body = new URLSearchParams({
    client_id: process.env.THREADS_CLIENT_ID!,
    client_secret: process.env.THREADS_CLIENT_SECRET!,
    grant_type: 'authorization_code',
    redirect_uri: getCallbackUrl('threads'),
    code,
  });

  const { data: shortToken } = await axios.post<{ access_token: string; user_id: number }>(
    TH_TOKEN_URL,
    body.toString(),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
  );

  // Step 2: exchange for long-lived token (~60 days)
  const { data: longToken } = await axios.get<{
    access_token: string;
    token_type: string;
    expires_in: number;
  }>(TH_LONGTOKEN_URL, {
    params: {
      grant_type: 'th_exchange_token',
      client_secret: process.env.THREADS_CLIENT_SECRET,
      access_token: shortToken.access_token,
    },
  });

  return { accessToken: longToken.access_token, expiresIn: longToken.expires_in };
};

const getThreadsProfile = async (accessToken: string): Promise<SocialProfile> => {
  const { data } = await axios.get<{
    id: string;
    name?: string;
    username: string;
    threads_profile_picture_url?: string;
  }>(TH_GRAPH_ME, {
    params: {
      fields: 'id,name,username,threads_profile_picture_url',
      access_token: accessToken,
    },
  });

  return {
    platformId: data.id,
    name: data.name ?? data.username,
    avatarUrl: data.threads_profile_picture_url,
  };
};

// ─── Shared upsert ────────────────────────────────────────────────────────────

const upsertAccount = async (
  userId: string,
  platform: SocialPlatform,
  profile: SocialProfile,
  tokens: OAuthTokens,
): Promise<void> => {
  const expiresAt = tokens.expiresIn
    ? new Date(Date.now() + tokens.expiresIn * 1000)
    : null;

  const payload = {
    accountId: profile.platformId,
    accountName: profile.name,
    avatarUrl: profile.avatarUrl ?? null,
    accessToken: encrypt(tokens.accessToken),
    refreshToken: tokens.refreshToken ? encrypt(tokens.refreshToken) : null,
    expiresAt,
  };

  await prisma.socialAccount.upsert({
    where: { userId_platform: { userId, platform } },
    create: { userId, platform, ...payload },
    update: payload,
  });
};

// ─── Callback handler ─────────────────────────────────────────────────────────

export const handleCallback = async (
  platform: string,
  code: string,
  state: string,
): Promise<void> => {
  const userId = await validateState(state);
  if (!userId) throw new Error('State token không hợp lệ hoặc đã hết hạn');

  if (platform === 'facebook') {
    const tokens = await exchangeFacebookCode(code);
    const profile = await getFacebookProfile(tokens.accessToken);
    await upsertAccount(userId, 'facebook', profile, tokens);
  } else if (platform === 'threads') {
    const tokens = await exchangeThreadsCode(code);
    const profile = await getThreadsProfile(tokens.accessToken);
    await upsertAccount(userId, 'threads', profile, tokens);
  } else if (platform === 'instagram') {
    const tokens = await exchangeInstagramCode(code);
    const profile = await getInstagramProfile(tokens.accessToken);
    await upsertAccount(userId, 'instagram', profile, tokens);
  } else {
    throw new Error(`Platform không được hỗ trợ: ${platform}`);
  }
};

// ─── Account management ───────────────────────────────────────────────────────

export const getSocialAccounts = (userId: string) =>
  prisma.socialAccount.findMany({
    where: { userId },
    select: {
      id: true,
      platform: true,
      accountName: true,
      accountId: true,
      avatarUrl: true,
      expiresAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

export const disconnectSocial = async (userId: string, platform: string): Promise<void> => {
  const exists = await prisma.socialAccount.findUnique({
    where: { userId_platform: { userId, platform } },
    select: { id: true },
  });
  if (!exists) throw new Error('Kết nối không tồn tại');

  await prisma.socialAccount.delete({
    where: { userId_platform: { userId, platform } },
  });
};

// ─── Threads token refresh ────────────────────────────────────────────────────
// Threads long-lived tokens expire in 60 days; refresh extends them another 60 days.

export const refreshThreadsToken = async (userId: string): Promise<void> => {
  const account = await prisma.socialAccount.findUnique({
    where: { userId_platform: { userId, platform: 'threads' } },
    select: { accessToken: true },
  });
  if (!account?.accessToken) throw new Error('Không tìm thấy access token');

  const { data } = await axios.get<{ access_token: string; expires_in: number }>(
    'https://graph.threads.net/refresh_access_token',
    {
      params: {
        grant_type: 'th_refresh_token',
        access_token: decrypt(account.accessToken),
      },
    },
  );

  await prisma.socialAccount.update({
    where: { userId_platform: { userId, platform: 'threads' } },
    data: {
      accessToken: encrypt(data.access_token),
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    },
  });
};
