# Database Migrations & Setup

## Pre-requisites
- Node.js 18+
- pnpm or npm
- SQLite (included with Prisma)

## Step 1: Install Dependencies

```bash
pnpm install
# or
npm install
```

## Step 2: Update Prisma Schema

The schema has been updated with new Timeline models:
- `TimelineEvent`
- `TimelineComment`
- `TimelineCommentVote`
- `TimelineLike`

File: `prisma/schema.prisma`

## Step 3: Create/Migrate Database

### For Development (SQLite)

```bash
# Create migration
pnpm prisma migrate dev --name add_timeline_models

# Or push schema directly
pnpm prisma db push
```

This will:
1. Create `prisma/dev.db` (SQLite database)
2. Apply all schema changes
3. Generate Prisma Client

### For Production

Update your `DATABASE_URL` in `.env` to use your production database (PostgreSQL, MySQL, etc.)

```bash
# Check pending migrations
pnpm prisma migrate status

# Deploy migrations
pnpm prisma migrate deploy
```

## Step 4: Seed Initial Data

### Option A: Using Seed Script

```bash
# Run seed file
pnpm prisma db seed
```

**Note:** Update `prisma/package.json` to include seed script if not present:

```json
{
  "scripts": {
    "db:seed": "node prisma/seed-timeline.ts"
  }
}
```

### Option B: Manual Seeding

You can manually add events through the admin panel at `/admin/timeline` after the migration.

## Step 5: Verify Setup

### Open Prisma Studio

```bash
pnpm prisma studio
```

This opens a GUI at `http://localhost:5555` where you can:
- View all tables
- See seeded data
- Add/edit/delete records
- Check relationships

### Test API Endpoints

```bash
# Start development server
pnpm dev

# In another terminal, test the API
curl http://localhost:3000/api/timeline/events

# You should see JSON array of events
```

## Step 6: Access Timeline

### Public Timeline
```
http://localhost:3000/timeline
```

### Admin Panel
```
http://localhost:3000/admin/timeline
```

---

## Database Schema Overview

```
TimelineEvent (1) ──────→ (∞) TimelineComment
        ↓
        └──────→ (∞) TimelineLike

TimelineComment (1) ──────→ (∞) TimelineCommentVote
        ↓ (replies)
        └──────→ (∞) TimelineComment (self-referential)
```

## Common Issues & Solutions

### Issue: "Error: SQLITE_CANTOPEN: unable to open database file"

**Solution:**
```bash
# Make sure prisma directory exists
mkdir -p prisma

# Run migration again
pnpm prisma db push
```

### Issue: "Error: Prisma Client validation error"

**Solution:**
```bash
# Regenerate Prisma Client
pnpm prisma generate
```

### Issue: Events not appearing after seed

**Solution:**
```bash
# Check if data was seeded
pnpm prisma studio

# Manually verify in database
pnpm prisma db execute --stdin < query.sql
```

### Issue: "Unique constraint failed" on seed

**Solution:** The seed script uses `upsert` to prevent duplicates. If this occurs:
```bash
# Delete the database and reseed
rm prisma/dev.db
pnpm prisma db push
pnpm prisma db seed
```

## Environment Variables

Create `.env` file in project root:

```env
# Database
DATABASE_URL="file:./dev.db"

# For production (PostgreSQL example)
# DATABASE_URL="postgresql://user:password@localhost:5432/techbox?schema=public"
```

## Backup & Restore

### Backup SQLite Database
```bash
cp prisma/dev.db prisma/dev.db.backup
```

### Restore from Backup
```bash
cp prisma/dev.db.backup prisma/dev.db
```

### Export Data to JSON
```bash
pnpm prisma db execute --stdin < export.sql > data.json
```

## Advanced: Custom Seed Data

Edit `prisma/seed-timeline.ts` to add more events:

```typescript
const timelineEvents = [
  {
    title: "Your Event Title",
    description: "Event description here",
    image: null,
    dateGr: new Date('YYYY-MM-DD'),
    importance: 8,
    tags: ['tag1', 'tag2'],
  },
  // ... more events
];
```

Then re-seed:
```bash
pnpm prisma db seed
```

## Testing the Module

### Automated Tests (To be implemented)
```bash
pnpm test
```

### Manual Testing Checklist
- [ ] Public timeline loads at `/timeline`
- [ ] Zoom controls work (in/out/reset)
- [ ] Pan/drag works smoothly
- [ ] Cards display correctly with Solar Hijri dates
- [ ] Admin panel loads at `/admin/timeline`
- [ ] Can create new event via form
- [ ] Can edit existing event
- [ ] Can delete event
- [ ] Events appear on timeline after creation

---

## Migration Path from Old System

If migrating from an older system:

1. **Backup old database**
   ```bash
   cp old_db.db old_db.db.backup
   ```

2. **Export old timeline data**
   ```sql
   SELECT * FROM old_timeline_table INTO OUTFILE 'timeline_export.csv';
   ```

3. **Transform CSV to seed format**
   - Write a script to convert CSV to seed data
   - Update `prisma/seed-timeline.ts`

4. **Run migration**
   ```bash
   pnpm prisma db push
   pnpm prisma db seed
   ```

5. **Verify data**
   ```bash
   pnpm prisma studio
   ```

## Support

For database issues:
1. Check Prisma documentation: https://www.prisma.io/docs
2. Run `pnpm prisma doctor` for diagnostics
3. Check `.env` configuration
4. Review migration files in `prisma/migrations/`
