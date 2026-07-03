# Timeline Module - Quick Start

## راهنمای سریع خط‌زمان تکنولوژی

### Installation & Setup (5 minutes)

```bash
# 1. Install dependencies
pnpm install

# 2. Setup database
pnpm prisma db push

# 3. Seed sample data (10 events)
pnpm prisma db seed

# 4. Start development server
pnpm dev
```

### Access the Timeline

| URL | Purpose | Access |
|-----|---------|--------|
| `http://localhost:3000/timeline` | Public timeline view | Everyone |
| `http://localhost:3000/admin/timeline` | Event management | Admins |

---

## فائلهای مهم / Key Files

### Components
- `features/timeline/components/TimelineCard.tsx` - Event card component
- `features/timeline/components/TimelineContainer.tsx` - Main timeline visualization
- `features/timeline/components/ZoomControls.tsx` - Zoom/pan controls

### Pages
- `app/timeline/page.tsx` - Public timeline (read-only)
- `app/admin/timeline/page.tsx` - Admin panel (CRUD)
- `app/admin/timeline/components/TimelineEventForm.tsx` - Event form

### API
- `app/api/timeline/events/route.ts` - GET/POST events
- `app/api/timeline/events/[id]/route.ts` - GET/PUT/DELETE event

### Database
- `prisma/schema.prisma` - Database models
- `prisma/seed-timeline.ts` - Sample data

### Utilities
- `lib/jalali.ts` - Solar Hijri calendar converter
- `types/timeline.ts` - TypeScript types
- `constants/timeline.ts` - Configuration

---

## داستورالعمل‌ها / Instructions

### View Timeline
1. Go to `/timeline`
2. Use zoom buttons (bottom-right) to scale: `+`, `-`, `⇱`
3. Drag to pan left/right
4. Hover over cards for details

### Manage Events (Admin)
1. Go to `/admin/timeline`
2. Click "New Event" to create
3. Fill form with event details
4. Click "Save Event"
5. To edit: Expand event, click "Edit"
6. To delete: Expand event, click "Delete"

### Add Event Form
- **Title**: Event name (Persian/English)
- **Description**: Details (required)
- **Image URL**: Optional link to image
- **Date**: Calendar date picker
- **Importance**: 1-10 scale (affects card size)
- **Tags**: Comma-separated keywords

---

## قابلیت‌ها / Features

✅ Interactive zoom (0.5x to 3x)
✅ Pan/drag navigation
✅ Temporal spacing (year-based)
✅ Solar Hijri dates (Persian calendar)
✅ Card importance scaling
✅ Admin event management
✅ Create/edit/delete events
✅ Comment & like structure (ready for implementation)
✅ Dark theme UI
✅ RTL-ready for Persian

---

## انتظار برای بهبود / Coming Soon

- [ ] Comment system (UI ready)
- [ ] Like/voting (UI ready)
- [ ] Search & filter
- [ ] Tag categories
- [ ] Mobile touch gestures
- [ ] Event detail modal
- [ ] Analytics

---

## API Examples

### Get All Events
```bash
curl http://localhost:3000/api/timeline/events
```

### Create Event
```bash
curl -X POST http://localhost:3000/api/timeline/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "رويداد جديد",
    "description": "توضيح",
    "dateGr": "2024-01-15",
    "dateFa": "1402/10/25",
    "year": 2024,
    "yearFa": 1402,
    "importance": 7,
    "tags": ["tag1", "tag2"]
  }'
```

### Update Event
```bash
curl -X PUT http://localhost:3000/api/timeline/events/{id} \
  -H "Content-Type: application/json" \
  -d '{...}'
```

### Delete Event
```bash
curl -X DELETE http://localhost:3000/api/timeline/events/{id}
```

---

## Troubleshooting

**Events not showing?**
- Check: `/api/timeline/events` in browser
- Verify database: `pnpm prisma studio`
- Check console for errors

**Dates wrong?**
- Verify `lib/jalali.ts` is loaded
- Check gregorian dates are valid
- Test: `getJalaliDateStringPersian(new Date())`

**Form not submitting?**
- Check all required fields filled
- Look at Network tab in DevTools
- Check API endpoint response

**Zoom/pan not working?**
- Check mouse events are registered
- Verify CSS transforms applied
- Clear browser cache

---

## Documentation

- Full usage guide: `readme/TIMELINE_USAGE.md`
- Database setup: `readme/DATABASE_SETUP.md`
- This file: `readme/QUICK_START.md`

---

**Ready to explore the timeline! 🚀**
