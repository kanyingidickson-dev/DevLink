# DevLink

DevLink is a small profile hub for developers: links, skills, and a clean public profile page.

## Features

- **Auth**
  - Email + password (credentials)
  - Optional OAuth (GitHub, Google) if env vars are set
- **Dashboard**
  - Edit username, display name, bio, skills, avatar URL
  - Add/remove links
  - View basic analytics (views, clicks)
- **Public profile**
  - `GET /u/:username`
  - Tracked links via `GET /l/:linkId` (click count + redirect)

## Tech

- Next.js (App Router)
- NextAuth
- Prisma + Postgres
- Tailwind CSS

## Getting started

### 1) Install dependencies

```bash
npm install
```

### 2) Start Postgres (recommended)

```bash
docker compose up -d
```

This repo maps the container's `5432` to host `5433` to avoid conflicts with an existing local Postgres.

### 3) Configure env

Create `.env` (or copy from `.env.example`) and fill in at least:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`

Optional (enables OAuth buttons):

- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

### 4) Setup database

```bash
npx prisma migrate dev
```

Optional seed data:

```bash
npm run db:seed
```

Seeded credentials:

- Email: `demo@devlink.local`
- Password: `password123`

### 5) Run dev server

```bash
npm run dev
```

Open:

- `http://localhost:3000`
- Create an account at `http://localhost:3000/login`

## Routes

- `GET /dashboard` (authenticated)
- `GET /u/:username` (public)
- `GET /l/:linkId` (public tracked redirect)

## Notes / tradeoffs

- Link click tracking is done via a server redirect route (`/l/:linkId`) so it works without client JS.
- OAuth is optional to keep local setup simple.
