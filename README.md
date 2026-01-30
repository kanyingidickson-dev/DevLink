# DevLink

DevLink is a small profile hub for developers: links, skills, and a clean public profile page.

🔗 [Live Demo](https://kanyingidickson-dev.github.io/DevLink/)

This branch (`demo-msw`) is a **frontend-only demo** designed to run on **GitHub Pages** via **static export**. All API calls are handled by **MSW** with a seeded, in-browser database.

## Features

- **Auth (demo)**
  - Email + password (demo credentials)
  - Session stored in `localStorage` (`devlink_demo_user_id`)
- **Dashboard**
  - Edit username, display name, bio, skills, avatar URL
  - Add/remove links
  - View basic analytics (views, clicks)
- **Public profile**
  - `GET /u/:username`
  - Tracked links via `GET /l/:linkId` (click count + redirect)

## Tech

- Next.js (App Router)
- MSW (Mock Service Worker)
- Tailwind CSS

## Getting started

### 1) Install dependencies

```bash
npm install
```

### 2) Run dev server

```bash
npm run dev
```

Open `http://localhost:3000`.

### Demo login

Seeded demo credentials:

- Email: `demo@devlink.app`
- Password: `demo`

### Data persistence / reset

The demo database is seeded on first load and persisted in `localStorage`:

- `devlink_demo_db_v1`
- `devlink_demo_user_id`

To reset to a fresh seed, clear those keys in your browser storage.

### Optional env

- `NEXT_PUBLIC_MSW=disabled` disables MSW (useful for debugging).
- `NEXT_PUBLIC_BASE_PATH` is used for GitHub Pages basePath (see below).

## Routes

- `GET /dashboard` (authenticated)
- `GET /u/:username` (public)
- `GET /l/:linkId` (public tracked redirect)

## Notes / tradeoffs

- Link click tracking is implemented client-side for the demo.
- This branch is intentionally frontend-only; server routes and Prisma code are preserved under `src/server/` but are not used for the demo.

## Architecture

- `src/app` contains the pages for the demo.
- `src/components` contains reusable UI components.
- `src/lib` contains client helpers (like `apiUrl()` for basePath-aware API calls).
- `src/mocks` contains the MSW worker, handlers, and seeded demo DB.
- `src/server` contains the original server routes and Prisma code (preserved for reference, not used in the demo build).

## Contributing

- Use feature branches and pull requests.
- Write tests for new features or bug fixes.
- Run `npm run lint` and `npm test` before submitting.
- Document any new endpoints or major changes in README.
- For issues or questions, open a GitHub issue.

## Security

- This is a demo build. Authentication is handled client-side and stored in `localStorage`.
- Public routes include `/u/:username`, `/l/:linkId`, and discover endpoints.
- Login `callbackUrl` only accepts relative paths.

## Deployment

This branch deploys to GitHub Pages using a static export.

- **Workflow**: `.github/workflows/pages.yml` (runs on pushes to `demo-msw`)
- **Base path**: set to `/DevLink` in the workflow via `NEXT_PUBLIC_BASE_PATH=/DevLink`
- **Output**: `next build` generates `./out` (uploaded to GitHub Pages)

In your repo settings:

- Set **Pages** source to **GitHub Actions**.
