import { OAUTH_STATE_COOKIE, encodeOAuthState } from "@shared/const";

export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

type OAuthConfig = {
  oauthPortalUrl: string;
  appId: string;
};

const getOAuthConfig = (): OAuthConfig | null => {
  const oauthPortalUrl = String(
    import.meta.env.VITE_OAUTH_PORTAL_URL ?? ""
  ).trim();
  const appId = String(import.meta.env.VITE_APP_ID ?? "").trim();

  if (!oauthPortalUrl || !appId) return null;

  try {
    const url = new URL(oauthPortalUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  } catch {
    return null;
  }

  return { oauthPortalUrl, appId };
};

export const isOAuthConfigured = getOAuthConfig() !== null;

export const startLogin = (): boolean => {
  const config = getOAuthConfig();
  if (!config) return false;

  const { oauthPortalUrl, appId } = config;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const nonce = crypto.randomUUID();
  const url = new URL(`${oauthPortalUrl.replace(/\/+$/, "")}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", encodeOAuthState({ redirectUri, nonce }));
  url.searchParams.set("type", "signIn");

  document.cookie = `${OAUTH_STATE_COOKIE}=${nonce}; Path=/; Max-Age=600; SameSite=None; Secure`;
  window.location.href = url.toString();
  return true;
};
