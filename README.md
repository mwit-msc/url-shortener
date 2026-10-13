# URL Shortener

[![Docker](https://img.shields.io/badge/Deployed%20with-Docker-2496ED?logo=docker)](https://www.docker.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)](https://www.prisma.io)
[![License: PolyForm Noncommercial](https://img.shields.io/badge/License-PolyForm%20NC-purple.svg)](./LICENSE)

A modern URL shortener with analytics, admin panel, and abuse reporting.

## Features

- **URL Shortening** - Create short links with custom slugs
- **Click Analytics** - Track clicks with device and browser info
- **Admin Panel** - User management, link moderation, domain management
- **Abuse Reporting** - Public abuse report system with admin review
- **Authentication** - Secure login with Google OAuth
- **Dark Mode** - System-aware theme switching

## Tech Stack

- Next.js 16 (Turbopack)
- React 19
- Prisma + PostgreSQL
- NextAuth.js
- Tailwind CSS
- Radix UI

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | NextAuth.js secret; fallback signing secret for direct links |
| `DIRECT_LINK_SECRET` | No | Optional separate signing key for direct links |
| `NEXTAUTH_URL` | Yes | Application URL |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |

## License

[PolyForm Noncommercial 1.0.0](./LICENSE)


## Direct links

Choose **Direct link** in the create-link form to generate a self-contained redirect at `/go/<token>`. The destination is encoded with unpadded base64url, using raw DEFLATE only when it saves space. An HMAC-SHA256 signature prevents destination changes. The signing secret remains on the server.

Creation uses the existing school-account session (and its database authentication). No destination mapping or link record is saved. Opening a direct link requires neither authentication nor a database query. Direct links use the application's `NEXTAUTH_URL` origin; saved links still support managed domains.

Direct links can be longer than the original URL. They offer no custom alias, account listing, click analytics, per-link editing, deletion, or database-backed abuse moderation. Encoding is reversible, not encryption; avoid sharing sensitive destinations. Destinations are limited to 4096 bytes after URL normalization, and only HTTP(S) URLs without embedded credentials are accepted.

Set `DIRECT_LINK_SECRET` for an independent signing key, or the application uses `NEXTAUTH_SECRET`. Keep that secret stable: rotating the active signing key invalidates previously created direct links. The `/go/` route deliberately does not import authentication or Prisma.

Run codec and tamper-resistance tests with `npm run test:direct-links` (Node.js 22.6+ with type stripping, or Node.js 24+).

## Dependency updates and verification

Install the committed dependency versions with `bun install --frozen-lockfile`, then run `bun x prisma generate`. Verify with `bun run lint`, `bun run test:direct-links`, and `bun run build`. Prisma generation does not migrate the database.

Dependencies target stable releases compatible with the application. TypeScript stays on 6.0 and ESLint on 9 while the React/TypeScript lint plugins do not support TypeScript 7 and ESLint 10. Prisma 8 and NextAuth 5 prereleases are excluded.

The release workflow builds and publishes the Docker image on pushes to `release/*`. Use `docker build -t mwit-tiny-check .` to verify that deployment build locally. Local environment files, installed packages, and generated build output are excluded from the Docker context.
