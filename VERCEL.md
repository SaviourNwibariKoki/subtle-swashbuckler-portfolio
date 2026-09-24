# Deploying this portfolio on Vercel

This project contains a React client and an Express/tRPC server. The Vercel server entrypoint is `api/index.ts`, and the Vercel client build uses `vite.vercel.config.ts`.

## Repository setup

The repository uses `package-lock.json`, so use npm commands:

```bash
npm install
npm run build
npm run check
npm test
```

`npm run build` creates the normal production client output in `dist/public` and the bundled server at `dist/server.cjs`. `npm run build:vercel` creates the Vercel client output in the root `public` directory.

## Vercel project settings

Keep the project root at the repository root and use these settings:

| Setting | Value |
|---|---|
| Install command | `npm install` |
| Build command | `npm run build:vercel` |
| Production branch | `main` |
| Static output | Root `public` directory |
| Server entrypoint | `api/index.ts` |
| Framework | None |

The checked-in `vercel.json` still contains package-manager commands from an earlier setup. This documentation does not change that file; configure the Vercel project with the npm commands above until the deployment configuration is updated separately.

## Environment variables

Set production values in **Vercel Project Settings → Environment Variables**. Never commit secrets to the repository. The current application environment is documented in `.env.example`:

| Variable | Used for |
|---|---|
| `DATABASE_URL` | MySQL connection for portfolio and admin content |
| `JWT_SECRET` | Signing and verifying the session cookie |
| `VITE_APP_ID` | OAuth application ID used by the sign-in flow |
| `OAUTH_SERVER_URL` | Server-side OAuth token and user service |
| `VITE_OAUTH_PORTAL_URL` | Browser sign-in portal |
| `OWNER_OPEN_ID` | Identity promoted to the admin role |
| `BUILT_IN_FORGE_API_URL` | Storage/media service base URL |
| `BUILT_IN_FORGE_API_KEY` | Authentication for the storage/media service |

The public homepage can use the included fallback content without a database. Configure the database and authentication variables when enabling persisted content or the `/admin` area. Configure the storage variables when using storage-backed media.

## Authentication and storage

The `/admin` area uses the OAuth callback at `/api/oauth/callback` and a signed session cookie. After authentication, the user record is synchronized with the database and the owner identity is promoted when `OWNER_OPEN_ID` matches.

The server registers the media route `/manus-storage/*` through `server/_core/storageProxy.ts`. That route uses the two `BUILT_IN_FORGE_*` variables to obtain a short-lived media URL. Keep the local hero assets in `client/public/assets` available for the public page; storage configuration is needed for storage-backed profile or portfolio media.

## Build and deployment verification

Run the repository checks before deploying:

```bash
npm run build
npm run check
npm test
npm run build:vercel
```

The optional `scripts/verify-vercel-runtime.mjs` check exercises the production-mode `/` and `/admin` responses using the Vercel entrypoint. After deployment, verify these routes:

```text
/
/admin
/admin?tab=profile
/admin?tab=projects
```

The public route should load visible portfolio content. An unauthenticated visit to `/admin` should show the sign-in state; an authenticated owner should see the dashboard. Also verify that configured storage-backed media loads through the media proxy.

Vercel runs `api/index.ts` as a serverless function, so do not rely on a long-running local listener for deployment. The local development server remains `npm run dev`, and the normal production server can be started locally with `npm run start` after `npm run build`.
