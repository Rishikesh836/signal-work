# Signalwork

Lead outreach and tracking app for an AI consulting firm.

## Stack

- **Web**: React (Vite) + React Router
- **API**: Node.js + Express + Prisma
- **DB**: SQLite by default for local dev (zero setup); Postgres supported via docker-compose
- **AI**: Groq (free tier) for draft generation; Tavily (free tier) + Groq for AI Lead Scout web search
- Both AI integrations gracefully fall back to clearly-labeled mock data if their API keys are unset, so the app is fully runnable without any keys.

## Monorepo layout

```
apps/web      React frontend
apps/api      Express API + Prisma schema
packages/shared  Constants/enums shared by web + api
```

## Setup (local dev, SQLite)

1. Install dependencies from the repo root:
   ```
   npm install
   ```
2. Configure the API env:
   ```
   cp apps/api/.env.example apps/api/.env
   ```
   Optionally add `GROQ_API_KEY` (https://console.groq.com/keys) and `TAVILY_API_KEY`
   (https://tavily.com) for real AI drafts and Scout results. Leave them blank to use mock data.
3. Create the SQLite database and run migrations:
   ```
   npm run db:migrate
   ```
4. Seed sample data (creates demo login `demo@signalwork.io` / `password123`):
   ```
   npm run db:seed
   ```
5. Run the API and web app in two terminals:
   ```
   npm run dev:api
   npm run dev:web
   ```
6. Open http://localhost:5173 and log in with the demo account (or sign up).

## Using Postgres instead of SQLite

1. In `apps/api/prisma/schema.prisma`, change the datasource provider from `sqlite` to `postgresql`.
2. Set `DATABASE_URL` in `apps/api/.env` to your Postgres connection string (or use docker-compose, below).
3. Re-run `npm run db:migrate`.

## Running everything with Docker

```
docker compose up --build
```

Brings up Postgres, the API (port 4000), and the web app (port 5173). Set `GROQ_API_KEY` /
`TAVILY_API_KEY` in your shell environment before running if you want real AI features. Note:
docker-compose provisions Postgres, so switch the Prisma provider as described above before
building the API image, or migrations will fail against a `sqlite` schema pointed at a Postgres URL.

## API surface

See `apps/api/src/routes/` for the full implementation. Key endpoints:

```
POST   /api/auth/signup
POST   /api/auth/login
GET    /api/leads
POST   /api/leads
GET    /api/leads/:id
PATCH  /api/leads/:id
DELETE /api/leads/:id
POST   /api/leads/:id/contacts
PATCH  /api/contacts/:id
DELETE /api/contacts/:id
POST   /api/leads/:id/interactions
GET    /api/leads/:id/interactions
POST   /api/leads/:id/drafts
GET    /api/dashboard
POST   /api/leads/import
GET    /api/leads/export
POST   /api/scout
POST   /api/scout/accept
```

All routes except `/api/auth/*` require an `Authorization: Bearer <token>` header.

## Migrating data from the original prototype

The original single-file prototype stored leads as a JSON array in `localStorage`. To import it:

1. In the old app's browser console, run `copy(localStorage.getItem("leads"))` to copy the JSON.
2. Convert it to CSV matching the columns documented in the Settings page (or write a one-off
   script using `apps/api/src/services/csv.js`'s `parseLeadsCsv` as a reference for the expected shape).
3. Use the Settings page's CSV import, which validates rows and reports per-row errors without
   failing the whole batch.
