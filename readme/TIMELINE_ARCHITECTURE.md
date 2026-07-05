<!--
  Technology Timeline - Interactive Timeline Component
  خط‌زمان تکنولوژی - جزء خط‌زمان تعاملی
-->

# Timeline Module Architecture

## System Design

```
User (Browser)
    |
    v
┌─────────────────────────────────┐
│   Public Timeline Page          │
│  /timeline                      │
│  - TimelineContainer.tsx        │
│  - TimelineCard.tsx (x10)       │
│  - ZoomControls.tsx             │
└────────────┬────────────────────┘
             |
    ┌────────┴────────┐
    |                 |
    v                 v
┌──────────────┐  ┌──────────────┐
│ Mouse Events │  │ State Hooks   │
├──────────────┤  ├──────────────┤
│ - Pan/Drag   │  │ useZoom      │
│ - Zoom +/-   │  │ usePan       │
│ - Reset      │  │ useEvents    │
└──────┬───────┘  └──────┬───────┘
       |                 |
       └────────┬────────┘
                v
    ┌───────────────────────┐
    │   API Fetch Layer     │
    │ /api/timeline/events  │
    └───────────┬───────────┘
                v
    ┌───────────────────────┐
    │  Prisma Client        │
    │  (ORM)                │
    └───────────┬───────────┘
                v
    ┌───────────────────────┐
    │  SQLite Database      │
    │  TimelineEvent        │
    │  TimelineComment      │
    │  TimelineLike         │
    └───────────────────────┘

                |
        ┌───────┴────────┐
        |                |
        v                v
┌──────────────┐  ┌──────────────────┐
│ Admin Panel  │  │ Event Mgmt API   │
│ /admin/      │  │ POST/PUT/DELETE  │
│ timeline     │  │ /api/timeline    │
└──────────────┘  └──────────────────┘
```

## Component Hierarchy

```
TimelinePage (app/timeline/page.tsx)
├── TimelineLoading
├── TimelineError
└── TimelineContainer
    ├── ZoomControls
    │   ├── ZoomInButton
    │   ├── ZoomOutButton
    │   └── ResetButton
    └── TimelineAxis
        ├── TimelineCard (n=10)
        │   ├── CardImage
        │   ├── CardContent
        │   │   ├── DateDisplay (Jalali)
        │   │   ├── Title
        │   │   ├── Description
        │   │   └── Tags[]
        │   └── CardFooter
        │       ├── LikeButton
        │       └── CommentButton
        └── EventPositioner (CSS transforms)
```

## Data Flow

```
1. PAGE LOAD
   ↓
   useTimelineEvents() → fetch('/api/timeline/events')
   ↓
   Prisma.timelineEvent.findMany() → SQLite Query
   ↓
   Events sorted by dateGr (ascending)
   ↓
   Set state: events[] = [...]

2. RENDER
   ↓
   For each event:
     - Calculate year offset from first event
     - Position: yearOffset × 100px (PIXELS_PER_YEAR)
     - Size based on importance (1-10)
     - Alternate top/bottom for clarity

3. USER INTERACTION
   ↓
   Mouse down → startPanning()
   ├─ Record start position
   └─ Set isDragging = true
   ↓
   Mouse move → handlePan()
   ├─ Calculate delta
   └─ Update pan state
   ↓
   Mouse up → stopPanning()
   ├─ Set isDragging = false
   └─ Keep position (no reset)
   ↓
   Zoom button → zoomIn() | zoomOut()
   ├─ Update zoom state (0.5 - 3.0)
   └─ Apply CSS transform scaleX

4. ADMIN CRUD
   ↓
   Form submit → fetch('/api/timeline/events', POST/PUT)
   ↓
   Prisma.timelineEvent.create() or .update()
   ↓
   Database write
   ↓
   Return updated event
   ↓
   UI refresh via refetch
```

## State Management

### TimelinePage
```typescript
const { events, isLoading, error } = useTimelineEvents()
// State: events[], loading, error

const { zoom, zoomIn, zoomOut, resetZoom } = useTimelineZoom(1)
// State: zoom float (0.5 - 3.0)

const { pan, startPanning, stopPanning, handlePan, resetPan } = usePan()
// State: pan { x: number, y: number }
```

### AdminTimelinePage
```typescript
const [events, setEvents] = useState<TimelineEvent[]>([])
const [showForm, setShowForm] = useState(false)
const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null)
const [expandedId, setExpandedId] = useState<string | null>(null)
```

## Styling Strategy

### Responsive Layout
- Desktop: Full width timeline, cards visible
- Tablet: Zoom in to see details
- Mobile: Fully supported with pan/zoom

### Dark Theme Variables
```css
--bg-primary: #0f172a (slate-950)
--bg-secondary: #0f172a (slate-900)
--border-color: #1e293b (slate-700)
--text-primary: #ffffff
--text-secondary: #94a3b8 (slate-400)
--accent-primary: #2563eb (blue-600)
--accent-hover: #1d4ed8 (blue-700)
```

### Card Sizing Algorithm
```typescript
function getCardSize(importance: number) {
  if (importance >= 8) return 'w-80 h-96'   // 320x384px
  if (importance >= 6) return 'w-72 h-80'   // 288x320px
  if (importance >= 4) return 'w-64 h-72'   // 256x288px
  return 'w-56 h-64'                        // 224x256px
}
```

## Performance Optimization

### Current
- Lazy loading events on page load
- React memoization on cards (potential)
- CSS transforms for smooth pan/zoom
- Event pagination not yet needed (10 events)

### Future Optimizations
- Virtual scrolling for 1000+ events
- Card memoization: `React.memo(TimelineCard)`
- Debounce pan/zoom calculations
- IndexedDB caching for offline mode
- Service Worker for PWA

## Error Handling

```
API Error
  ↓
Fetch fails
  ↓
Catch block
  ↓
Set error state
  ↓
Render <TimelineError>
  ↓
Show message + retry button
```

## Database Relationships

```
TimelineEvent (1)
├─ comments (1:N) → TimelineComment
├─ likes (1:N) → TimelineLike
└─ published (Boolean)

TimelineComment (1)
├─ event (N:1) → TimelineEvent (FK)
├─ parent (Self-referential for replies)
├─ replies (1:N) → TimelineComment
├─ votes (1:N) → TimelineCommentVote
└─ CASCADE DELETE on event deletion

TimelineLike
├─ event (N:1) → TimelineEvent (FK)
├─ fingerprint (String - user identifier)
└─ UNIQUE(fingerprint, eventId)

TimelineCommentVote
├─ comment (N:1) → TimelineComment (FK)
├─ fingerprint (String)
└─ UNIQUE(fingerprint, commentId)
```

## Security Considerations

✓ **Completed**
- Input validation (title, description required)
- Date format validation (YYYY-MM-DD)
- XSS prevention (React escapes content)
- SQL injection prevention (Prisma ORM)

⚠ **To Implement**
- Admin authentication/authorization
- Rate limiting on API
- CORS configuration
- Input sanitization (HTML tags)
- File upload validation (for images)

## Accessibility (a11y)

✓ **Completed**
- Semantic HTML (buttons, forms)
- ARIA labels on controls
- Keyboard navigation ready
- Color contrast (dark theme)
- RTL support for Persian

⚠ **To Implement**
- Keyboard shortcuts (±, 0 for zoom)
- Screen reader descriptions
- Focus management
- Alt text for images
- Reduced motion preference

## Testing Strategy

### Unit Tests (Jest)
```typescript
// lib/jalali.ts
test('gregorianToJalali converts 2024-01-15 correctly')
test('formatJalaliDate formats date properly')

// Custom hooks
test('useTimelineZoom respects min/max bounds')
test('usePan tracks drag correctly')
```

### Integration Tests (React Testing Library)
```typescript
test('Timeline loads and displays events')
test('Zoom buttons change zoom level')
test('Pan drag updates position')
```

### E2E Tests (Cypress/Playwright)
```typescript
test('User can create, edit, delete event in admin panel')
test('Event appears on public timeline after creation')
```

## Deployment Checklist

- [ ] Database migrations run
- [ ] Seed data loaded
- [ ] API endpoints tested
- [ ] Timeline page loads
- [ ] Admin panel protected
- [ ] Environment variables set
- [ ] Build succeeds: `pnpm build`
- [ ] No console errors
- [ ] Mobile responsive check
- [ ] Performance audit (Lighthouse)

---

**Module Status:** ✅ MVP Complete - Ready for Enhancement
