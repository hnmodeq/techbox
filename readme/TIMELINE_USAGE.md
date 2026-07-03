# Technology Timeline Module - Usage Guide

## خط‌زمان تکنولوژی - راهنمای استفاده

### Public Timeline Page

**URL:** `/timeline`

The public-facing interactive timeline visualization with zoom, pan, and event viewing capabilities.

#### Features:
- **Zoom Controls** (bottom-right corner)
  - Zoom In: Scale up to 300% (3x)
  - Zoom Out: Scale down to 50% (0.5x)
  - Reset: Return to initial 100% zoom
  - Display: Current zoom percentage

- **Pan Navigation**
  - Click and drag anywhere on the timeline to pan left/right
  - Grab cursor indicates draggable area
  - Smooth pan experience with position memory

- **Event Cards**
  - Positioned by actual year (100px = 1 year)
  - Size based on importance (1-10 scale)
  - Display date in Solar Hijri (Persian calendar)
  - Show title, description, tags, image
  - Like and comment buttons (UI ready)
  - Hover effects and smooth transitions

- **Timeline Axis**
  - Horizontal blue gradient line
  - Blue dots at event positions
  - Visual reference for event placement

#### Keyboard Shortcuts (Future Enhancement)
- `+` / `=`: Zoom in
- `-` / `_`: Zoom out
- `0`: Reset zoom
- `Arrow Keys`: Pan left/right

---

### Admin Panel

**URL:** `/admin/timeline`

Full event management interface for administrators.

#### Capabilities:

1. **View All Events**
   - List all published timeline events
   - Sorted chronologically by date
   - Expand/collapse for details
   - Shows importance level and date

2. **Create New Event**
   - Click "New Event" button
   - Form opens with empty fields
   - Required fields: Title, Description, Date
   - Optional fields: Image URL, Tags, Importance

3. **Edit Event**
   - Expand event card
   - Click "Edit" button
   - Form pre-fills with current data
   - Auto-calculates Solar Hijri date
   - Save changes or cancel

4. **Delete Event**
   - Expand event card
   - Click "Delete" button
   - Confirmation required
   - Event removed immediately

#### Event Form Fields:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Title | Text | Yes | Event name in Persian or English |
| Description | Textarea | Yes | Detailed explanation (4+ lines) |
| Image URL | URL | No | Link to event image (HTTPS) |
| Date (Gregorian) | Date | Yes | Calendar picker |
| Date (Solar Hijri) | Text | No | Auto-calculated, read-only |
| Importance | Range | No | 1-10 scale, default 5 |
| Tags | Text | No | Comma-separated keywords |

#### Example Event Entry:

**Title:** معرفی iPhone

**Description:** معرفی اولین iPhone توسط استیو جابز در سال 2007 که صنعت موبایل را متحول کرد و دوران اسمارت‌فون را آغاز کرد.

**Date:** 2007-06-29

**Importance:** 10

**Tags:** آیفون، موبایل، انقلاب، اپل

---

## API Reference

### GET /api/timeline/events
Fetch all published timeline events.

**Response:**
```json
[
  {
    "id": "cuid123",
    "title": "معرفی iPhone",
    "description": "...",
    "image": null,
    "dateGr": "2007-06-29T00:00:00.000Z",
    "dateFa": "1386/04/09",
    "year": 2007,
    "yearFa": 1386,
    "importance": 10,
    "tags": ["آیفون", "موبایل"],
    "published": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "comments": [],
    "likes": []
  }
]
```

### POST /api/timeline/events
Create a new timeline event.

**Request Body:**
```json
{
  "title": "Event Title",
  "description": "Event description",
  "image": "https://example.com/image.jpg",
  "dateGr": "2024-01-15",
  "dateFa": "1402/10/25",
  "year": 2024,
  "yearFa": 1402,
  "importance": 7,
  "tags": ["tag1", "tag2"]
}
```

### GET /api/timeline/events/[id]
Fetch a specific event with comments and likes.

**Response:** Single event object (same format as GET /api/timeline/events)

### PUT /api/timeline/events/[id]
Update an existing event.

**Request Body:** Same as POST

**Response:** Updated event object

### DELETE /api/timeline/events/[id]
Delete an event and all associated comments/likes.

**Response:**
```json
{
  "success": true
}
```

---

## Database Schema

### TimelineEvent
- `id` (String, PK): Unique identifier (CUID)
- `title` (String): Event title
- `description` (String): Detailed description
- `image` (String?): Optional image URL
- `dateGr` (DateTime, Unique): Gregorian date
- `dateFa` (String, Unique): Solar Hijri formatted date
- `year` (Int): Gregorian year for sorting
- `yearFa` (Int): Solar Hijri year
- `importance` (Int): 1-10 scale (affects card size)
- `tags` (String): JSON array of tags
- `published` (Boolean): Visibility flag
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp
- Relations: `comments[]`, `likes[]`

### TimelineComment
- `id` (String, PK): Unique identifier
- `eventId` (String, FK): Reference to TimelineEvent
- `parentId` (String?, FK): Reference to parent comment (for replies)
- `authorName` (String): Commenter name (default: "مهمان")
- `text` (String): Comment text
- `likes` (Int): Like count
- `dislikes` (Int): Dislike count
- `createdAt` (DateTime): Comment timestamp
- Relations: `event`, `parent`, `replies[]`, `votes[]`

### TimelineLike
- `id` (String, PK): Unique identifier
- `fingerprint` (String): Device/user fingerprint
- `eventId` (String, FK): Reference to TimelineEvent
- Unique Constraint: (fingerprint, eventId) - prevent duplicate likes
- Relations: `event`

### TimelineCommentVote
- `id` (String, PK): Unique identifier
- `fingerprint` (String): Device/user fingerprint
- `commentId` (String, FK): Reference to TimelineComment
- `vote` (Int): +1 or -1
- Unique Constraint: (fingerprint, commentId) - one vote per user per comment
- Relations: `comment`

---

## Styling & Customization

### Colors
- Primary: Blue (`bg-blue-600`, `text-blue-400`)
- Accent: Slate (`bg-slate-900`, `border-slate-700`)
- Success: Green (future comments)
- Warning/Danger: Red/Orange (delete actions)

### Dark Theme
- Background: `bg-slate-950` (darkest)
- Surface: `bg-slate-900`
- Border: `border-slate-700`
- Text: `text-white`, `text-slate-400`

### Card Sizes (based on importance)
| Importance | Size | Width | Height |
|------------|------|-------|--------|
| 1-3 | Small | w-56 | h-64 |
| 4-5 | Medium | w-64 | h-72 |
| 6-7 | Large | w-72 | h-80 |
| 8-10 | XLarge | w-80 | h-96 |

---

## Troubleshooting

### Events not showing on timeline?
1. Check if events are `published: true` in database
2. Verify dates are in correct format (YYYY-MM-DD)
3. Check browser console for API errors
4. Ensure `/api/timeline/events` returns data

### Dates not converting to Solar Hijri?
1. Verify `lib/jalali.ts` is imported correctly
2. Check gregorian date is valid JavaScript Date
3. Test `gregorianToJalali()` function in browser console

### Cards overlapping or misaligned?
1. Check zoom level - may need to zoom out
2. Verify `PIXELS_PER_YEAR` constant (currently 100)
3. Check if events have valid `dateGr` values
4. Look at CSS transforms for pan/zoom

### Admin form not submitting?
1. Verify all required fields are filled
2. Check date format (should be YYYY-MM-DD)
3. Look at browser Network tab for API response
4. Ensure `/api/timeline/events` endpoint is working

---

## Future Enhancements

- [ ] Comment system implementation (UI ready)
- [ ] Like voting system (UI ready)
- [ ] Event filtering by tags/year range
- [ ] Event categories/branches
- [ ] Search functionality
- [ ] Mobile touch gestures
- [ ] Animation on card entry
- [ ] Event detail modal
- [ ] Bulk import from CSV
- [ ] Export to JSON/PDF
- [ ] Multi-language support
- [ ] Analytics dashboard
- [ ] Event revision history

---

## Support & Contact

For issues or questions about the Timeline module, contact the development team.
