# Saviour Nwibari Koki Portfolio

A React and TypeScript portfolio with a public homepage at `/` and an owner administration area at `/admin`.

## Requirements

- Node.js
- npm
- A database connection for persisted portfolio content and administration

## Installation

```bash
npm install
```

Copy `.env.example` to `.env` and provide the values needed for your environment. The public homepage can use the included fallback content when the database is unavailable.

## Available scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server with Vite HMR |
| `npm run build` | Create the production client and server build |
| `npm run build:vercel` | Create the Vercel client build |
| `npm run start` | Start the production server after building |
| `npm run check` | Run the TypeScript check |
| `npm run lint` | Run the TypeScript check used as the project lint command |
| `npm test` | Run the test suite |
| `npm run format` | Format the project with Prettier |
| `npm run db:push` | Generate and apply database migrations |

## Development server

```bash
npm run dev
```

Open `http://localhost:3000` in a browser. The local server watches the Express and Vite application and refreshes the client when files change.

## Production build

```bash
npm run build
npm run start
```

The client build is written to `dist/public`, and the bundled server is written to `dist/server.cjs`. Set the required environment variables before starting the production server.
