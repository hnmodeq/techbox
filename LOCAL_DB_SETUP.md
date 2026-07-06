# Running Postgres locally for development

Neon's free tier suspends its compute after ~5 minutes of inactivity. That's
fine for your **deployed** Vercel site (which gets steady traffic and rarely
sits idle that long), but it's a bad fit for **local development**, where
you naturally pause between clicks - that's why local dev sometimes sees a
multi-second delay on the first query after a break, even though the same
code is fast once the compute is warm.

The fix: run a real Postgres database on your own machine for local dev.
It never sleeps, has zero network latency (it's on `localhost`), and is
completely free with no usage limits. Keep using Neon only for your
deployed/production site on Vercel - nothing about your Vercel setup needs
to change.

## 1. Install Docker Desktop (Windows)

Download and install from https://www.docker.com/products/docker-desktop/
then make sure it's running (you'll see the whale icon in your system tray).

## 2. Start the local database

From your project folder:

```powershell
docker compose up -d
```

(If you have an older Docker install, the command might be `docker-compose up -d` with a hyphen instead.)

This starts a Postgres 16 container named `techbox-db`, listening on
`localhost:5433` (port 5433 is used instead of the default 5432 in case you
already have another Postgres installed locally). Data persists in a Docker
volume across restarts - you only need to run this once, then it stays
running in the background (or restart it any time with the same command).

## 3. Point your app at it

Update your `.env` (or `.env.local`) to use the local database instead of
Neon for development:

```
DATABASE_URL="postgresql://techbox:techbox@localhost:5433/techbox?schema=public"
DIRECT_URL="postgresql://techbox:techbox@localhost:5433/techbox?schema=public"
```

Keep a separate copy of your real Neon connection strings somewhere safe
(e.g. `.env.production.local`, which is gitignored) for when you actually
need to run migrations or seed data against production.

## 4. Create the schema and seed sample data

```powershell
npx prisma db push
npm run db:seed
```

`db push` creates all the tables from `prisma/schema.prisma` in your new
local database, and `db:seed` populates it with the same realistic mock
content (blog posts, forum threads, shop items, users, comments, etc.)
already included in `prisma/mock-data/`.

## 5. Run the app as normal

```powershell
npm run dev
```

Every request will now hit your local database directly - no cold starts,
no cross-region network latency. Page loads and API calls should feel
instant and consistent every time, not just on the second click.

## Useful commands

```powershell
docker compose ps          # check the container is running
docker compose logs -f db  # view Postgres logs
docker compose down        # stop the container (data is preserved)
docker compose down -v     # stop AND delete all local data (fresh start)
```
