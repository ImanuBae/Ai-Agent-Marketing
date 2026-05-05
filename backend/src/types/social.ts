export type SocialPlatform = 'facebook' | 'threads';

export interface SocialProfile {
  platformId: string;
  name: string;
  avatarUrl?: string;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number; // seconds
}
