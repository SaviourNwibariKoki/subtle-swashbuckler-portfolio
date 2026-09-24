import "dotenv/config";

const appId = process.env.VITE_APP_ID?.trim() ?? "";
const cookieSecret = process.env.JWT_SECRET?.trim() ?? "";
const oAuthServerUrl = process.env.OAUTH_SERVER_URL?.trim() ?? "";

export const ENV = {
  appId,
  cookieSecret,
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl,
  oauthConfigured: Boolean(oAuthServerUrl && appId && cookieSecret),
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
