# Novels-Twines Backend

Node.js + Express + TypeScript API foundation for the Novels-Twines website.

## Current status

This first foundation stage provides:
- Express application with Helmet security headers.
- CORS allow-list configuration through `CORS_ORIGIN`.
- JSON request-size limit and consistent 404/error responses.
- Health endpoint: `GET /api/health`.
- PostgreSQL Prisma schema for users and server-side sessions.
- Role model: new users default to `READER`; `CREATOR` and `ADMIN` are privileged roles.
- Creator application status for an approval workflow.
- Basic automated API tests and TypeScript type checking.

**Authentication is not implemented yet.** There are no registration, login, logout, password-reset, session-creation, or publishing endpoints in this foundation. Do not treat this API as production-ready.

## Requirements

- Node.js 20 or newer
- npm
- PostgreSQL 14 or newer (for database setup)

## Local setup

1. Install dependencies: `npm install`.
2. Copy `.env.example` to `.env` and update `DATABASE_URL` for your local PostgreSQL database.
3. Generate Prisma Client: `npm run db:generate`.
4. Create/apply the initial migration: `npm run db:migrate -- --name init`.
5. Start the development server: `npm run dev`.

The API runs at `http://localhost:4000` by default.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start development server with reload |
| `npm run build` | Compile TypeScript into `dist/` |
| `npm start` | Run compiled server |
| `npm run typecheck` | Check TypeScript types |
| `npm test` | Run API tests |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:migrate` | Run local development migrations |
| `npm run db:studio` | Open Prisma Studio |

## Environment variables

See `.env.example`. Real `.env` files, database passwords, session secrets, API keys, and GitHub App credentials must never be committed. Production secrets belong in the backend hosting provider's secret manager.

## Planned next stages

1. Authentication: open Reader registration, login/logout, Argon2id password hashing, secure HTTP-only cookies, and server-side session lifecycle.
2. Authorization: role checks and Admin-only Creator approval.
3. Content workflow: draft submission, Admin approval, and controlled publishing integration with the separate content repository.
4. Security and operations: rate limits, CSRF protection appropriate to cookie sessions, audit logs, CI migrations, and deployment configuration.

## Security notes

- Public registration must always assign `READER` on the server; clients must never choose their own role.
- Admin accounts must be provisioned through a controlled process, not public signup.
- Creator permissions must be granted only after Admin approval.
- Session tokens should be random, stored only as hashes, and delivered in secure, HTTP-only, same-site cookies when authentication is implemented.
- The health endpoint reports API process health only; it does not verify database connectivity.
