# Novels-Twines Backend

Node.js + Express + TypeScript API for Novels-Twines. Supabase Auth manages user sign-in; this API verifies Supabase access tokens and stores application roles and creator-approval state in PostgreSQL through Prisma.

## Implemented

- Helmet security headers, CORS allow-list, request-size limit, and consistent JSON errors.
- Health endpoint: `GET /api/health`.
- Supabase access-token verification on protected endpoints.
- User profile synchronization from the verified Supabase identity. New application profiles always receive the `READER` role.
- `GET /api/auth/me` returns the signed-in user's application profile.
- `POST /api/creator/applications` submits a Reader's creator application.
- Admin-only `GET /api/admin/creator-applications` lists pending applications.
- Admin-only `PATCH /api/admin/creator-applications/:userId` accepts `{"decision":"approve"}` or `{"decision":"reject"}`.
- Role and creator-application status are stored separately from Supabase's authentication identity.

## Important security boundaries

- Public registration and sign-in are handled by Supabase Auth. The browser must use only the Supabase project URL and publishable/anon key.
- The Supabase service-role key is server-only. Never place it in the website repository, browser JavaScript, or public GitHub Pages configuration.
- Clients cannot choose or update their own application role. New profiles are always Readers.
- Admins must be provisioned manually by an authorized operator in the database. There is no public endpoint to create or promote an Admin.
- Only Admins can approve creator applications. Approval changes the application role to `CREATOR`; rejection leaves the account as `READER`.
- Creator application approval does not yet publish story content. Content publishing and GitHub integration are separate future work.
- Configure Supabase Auth email confirmation, redirect URLs, password policies, and rate limits in the Supabase project before production use.

## Requirements

- Node.js 20 or newer
- npm
- PostgreSQL 14 or newer (Supabase Postgres is suitable)
- A Supabase project with Auth enabled

## Local setup

1. Install dependencies: `npm install`.
2. Copy `.env.example` to `.env`.
3. Set `DATABASE_URL` to the PostgreSQL connection string.
4. Set `SUPABASE_URL` and the server-only `SUPABASE_SERVICE_ROLE_KEY`.
5. Set `CORS_ORIGIN` to the exact website origin(s).
6. Generate Prisma Client: `npm run db:generate`.
7. Create/apply the database migration: `npm run db:migrate -- --name supabase-auth-profiles`.
8. Start the development server: `npm run dev`.

The API runs at `http://localhost:4000` by default.

## API overview

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/api/health` | Public | API process health |
| GET | `/api/auth/me` | Signed-in user | Return application profile |
| POST | `/api/creator/applications` | Reader | Apply to become a Creator |
| GET | `/api/admin/creator-applications` | Admin | List pending applications |
| PATCH | `/api/admin/creator-applications/:userId` | Admin | Approve or reject an application |

Protected endpoints expect `Authorization: Bearer <supabase-access-token>`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Compile TypeScript |
| `npm run typecheck` | Check TypeScript types |
| `npm test` | Run API tests |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:migrate` | Apply a local development migration |
| `npm run db:studio` | Open Prisma Studio |

## Current limitations

- The website sign-in/register interface has not yet been connected to Supabase.
- Supabase project configuration and database migration must be completed before protected endpoints can work.
- Creator applications are stored in the application database; there is no email notification or moderation dashboard yet.
- Story submission, review queues, publication records, and controlled Content-repository publishing are not implemented.
- The health endpoint reports API process health only; it does not verify Supabase or database connectivity.

## Environment and secrets

See `.env.example`. Never commit real environment files, database passwords, Supabase service-role keys, access tokens, or GitHub App credentials. Production secrets belong in the backend hosting provider's secret manager.
