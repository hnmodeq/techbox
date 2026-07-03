/**
 * Timeline Constants & Configuration
 */

export const TIMELINE_CONFIG = {
  // Spacing & Sizing
  PIXELS_PER_YEAR: 100,
  CARD_PADDING: 16,
  CARD_GAP: 20,
  TIMELINE_AXIS_HEIGHT: 4,
  AXIS_DOT_RADIUS: 8,

  // Zoom Settings
  MIN_ZOOM: 0.5,
  MAX_ZOOM: 3.0,
  DEFAULT_ZOOM: 1.0,
  ZOOM_STEP: 0.1,
  ZOOM_SPEED: 0.1,

  // Pan Settings
  PAN_SPEED: 1.0,
  MIN_PAN_DISTANCE: 5, // pixels before registering drag

  // Card Sizes (based on importance)
  CARD_SIZES: {
    small: 'w-56 h-64',    // importance 1-3: 224x256px
    medium: 'w-64 h-72',   // importance 4-5: 256x288px
    large: 'w-72 h-80',    // importance 6-7: 288x320px
    xlarge: 'w-80 h-96',   // importance 8-10: 320x384px
  },

  // Importance Scale
  MIN_IMPORTANCE: 1,
  MAX_IMPORTANCE: 10,
  DEFAULT_IMPORTANCE: 5,

  // Animation Settings
  ANIMATION_DURATION: 300, // milliseconds
  ANIMATION_EASING: 'cubic-bezier(0.4, 0, 0.2, 1)',

  // Colors (Tailwind classes)
  COLORS: {
    primary: 'bg-blue-600',
    primaryHover: 'bg-blue-700',
    secondary: 'bg-slate-900',
    border: 'border-slate-700',
    text: 'text-white',
    textSecondary: 'text-slate-400',
    accent: 'text-blue-400',
    error: 'bg-red-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
  },

  // API Settings
  API_TIMEOUT: 10000, // milliseconds
  API_RETRY_COUNT: 3,
  API_RETRY_DELAY: 1000, // milliseconds

  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,

  // Database
  DATE_FORMAT: 'YYYY-MM-DD',
  JALALI_DATE_FORMAT: 'YYYY/MM/DD',

  // Validation
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MIN_LENGTH: 10,
  DESCRIPTION_MAX_LENGTH: 5000,
  MAX_TAGS: 10,
  MAX_TAG_LENGTH: 50,
  IMAGE_MAX_SIZE: 5 * 1024 * 1024, // 5MB

  // Cache
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  CACHE_KEY_PREFIX: 'timeline_',

  // Default Event Details
  DEFAULT_AUTHOR_NAME: 'تحریریه', // "Editorial" in Persian
  DEFAULT_COMMENT_AUTHOR: 'مهمان', // "Guest" in Persian
} as const;

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

export const KEYBOARD_SHORTCUTS = {
  ZOOM_IN: ['+', '='],
  ZOOM_OUT: ['-', '_'],
  RESET_ZOOM: '0',
  PAN_LEFT: 'ArrowLeft',
  PAN_RIGHT: 'ArrowRight',
  PAN_UP: 'ArrowUp',
  PAN_DOWN: 'ArrowDown',
  ESCAPE: 'Escape',
  ENTER: 'Enter',
} as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ERROR_MESSAGES = {
  // Validation
  TITLE_REQUIRED: 'Please provide an event title',
  TITLE_TOO_SHORT: `Title must be at least ${TIMELINE_CONFIG.TITLE_MIN_LENGTH} characters`,
  TITLE_TOO_LONG: `Title must not exceed ${TIMELINE_CONFIG.TITLE_MAX_LENGTH} characters`,
  DESCRIPTION_REQUIRED: 'Please provide an event description',
  DESCRIPTION_TOO_SHORT: `Description must be at least ${TIMELINE_CONFIG.DESCRIPTION_MIN_LENGTH} characters`,
  DESCRIPTION_TOO_LONG: `Description must not exceed ${TIMELINE_CONFIG.DESCRIPTION_MAX_LENGTH} characters`,
  DATE_REQUIRED: 'Please select a date',
  DATE_INVALID: 'Please enter a valid date',
  IMPORTANCE_INVALID: `Importance must be between ${TIMELINE_CONFIG.MIN_IMPORTANCE} and ${TIMELINE_CONFIG.MAX_IMPORTANCE}`,
  IMAGE_URL_INVALID: 'Please enter a valid image URL',
  IMAGE_TOO_LARGE: `Image must not exceed ${TIMELINE_CONFIG.IMAGE_MAX_SIZE / 1024 / 1024}MB`,
  TAG_TOO_MANY: `Maximum ${TIMELINE_CONFIG.MAX_TAGS} tags allowed`,
  TAG_TOO_LONG: `Tag must not exceed ${TIMELINE_CONFIG.MAX_TAG_LENGTH} characters`,

  // API
  FETCH_FAILED: 'Failed to load timeline events',
  CREATE_FAILED: 'Failed to create event',
  UPDATE_FAILED: 'Failed to update event',
  DELETE_FAILED: 'Failed to delete event',
  API_ERROR: 'An API error occurred',
  NETWORK_ERROR: 'Network connection error',
  TIMEOUT_ERROR: 'Request timeout',

  // Database
  EVENT_NOT_FOUND: 'Event not found',
  DUPLICATE_DATE: 'An event with this date already exists',
  DATABASE_ERROR: 'Database error',

  // Authentication
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access denied',

  // General
  UNKNOWN_ERROR: 'An unknown error occurred',
  PLEASE_TRY_AGAIN: 'Please try again',
} as const;

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

export const SUCCESS_MESSAGES = {
  EVENT_CREATED: 'Event created successfully',
  EVENT_UPDATED: 'Event updated successfully',
  EVENT_DELETED: 'Event deleted successfully',
  EVENT_LIKED: 'Event liked',
  EVENT_UNLIKED: 'Like removed',
  COMMENT_ADDED: 'Comment added',
  COMMENT_DELETED: 'Comment deleted',
  EXPORT_COMPLETE: 'Export completed',
  IMPORT_COMPLETE: 'Import completed',
  COPY_LINK: 'Link copied to clipboard',
} as const;

// ============================================================================
// BUTTON LABELS
// ============================================================================

export const BUTTON_LABELS = {
  NEW_EVENT: 'New Event',
  SAVE: 'Save',
  SAVE_EVENT: 'Save Event',
  CANCEL: 'Cancel',
  DELETE: 'Delete',
  EDIT: 'Edit',
  CREATE: 'Create',
  UPDATE: 'Update',
  CLOSE: 'Close',
  BACK: 'Back',
  NEXT: 'Next',
  PREVIOUS: 'Previous',
  RETRY: 'Retry',
  LOADING: 'Loading...',
  SEARCH: 'Search',
  FILTER: 'Filter',
  EXPORT: 'Export',
  IMPORT: 'Import',
  SHARE: 'Share',
  LIKE: 'Like',
  UNLIKE: 'Unlike',
  COMMENT: 'Comment',
  REPLY: 'Reply',
  MORE: 'More',
  ZOOM_IN: 'Zoom In',
  ZOOM_OUT: 'Zoom Out',
  RESET: 'Reset',
} as const;

// ============================================================================
// FIELD LABELS
// ============================================================================

export const FIELD_LABELS = {
  TITLE: 'Title',
  DESCRIPTION: 'Description',
  DATE: 'Date',
  DATE_GREGORIAN: 'Date (Gregorian)',
  DATE_JALALI: 'Date (Solar Hijri)',
  IMPORTANCE: 'Importance',
  TAGS: 'Tags',
  IMAGE: 'Image URL',
  PUBLISHED: 'Published',
  AUTHOR: 'Author',
  CREATED_AT: 'Created',
  UPDATED_AT: 'Updated',
  SEARCH: 'Search events',
  FILTER_BY_YEAR: 'Filter by year',
  FILTER_BY_TAG: 'Filter by tag',
  SORT_BY: 'Sort by',
} as const;

// ============================================================================
// PLACEHOLDER TEXT
// ============================================================================

export const PLACEHOLDERS = {
  TITLE: 'Event title in Persian or English',
  DESCRIPTION: 'Detailed description of the event',
  IMAGE_URL: 'https://example.com/image.jpg',
  TAGS: 'tag1, tag2, tag3',
  SEARCH: 'Search by title, description, or tags...',
  AUTHOR: 'Your name',
  COMMENT: 'Add a comment...',
} as const;

// ============================================================================
// SORT OPTIONS
// ============================================================================

export const SORT_OPTIONS = [
  { value: 'date', label: 'Date (Oldest First)' },
  { value: 'date-desc', label: 'Date (Newest First)' },
  { value: 'importance', label: 'Importance (High to Low)' },
  { value: 'importance-asc', label: 'Importance (Low to High)' },
  { value: 'created', label: 'Created (Newest First)' },
  { value: 'updated', label: 'Updated (Newest First)' },
] as const;

// ============================================================================
// IMPORTANCE LABELS
// ============================================================================

export const IMPORTANCE_LABELS: Record<number, string> = {
  1: 'Trivial',
  2: 'Very Minor',
  3: 'Minor',
  4: 'Low',
  5: 'Medium',
  6: 'High',
  7: 'Very High',
  8: 'Major',
  9: 'Critical',
  10: 'Milestone',
} as const;

// ============================================================================
// REGEX PATTERNS
// ============================================================================

export const REGEX_PATTERNS = {
  // URL validation
  URL: /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&/=]*)$/,

  // Email validation
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  // Date validation (YYYY-MM-DD)
  DATE: /^\d{4}-\d{2}-\d{2}$/,

  // Jalali date validation (YYYY/MM/DD)
  JALALI_DATE: /^\d{4}\/\d{2}\/\d{2}$/,

  // Tag validation (alphanumeric + dash/underscore)
  TAG: /^[\w-\u0600-\u06FF]+$/,

  // Slug validation
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,

  // Persian text
  PERSIAN: /^[\u0600-\u06FF\s]+$/,

  // Number range 1-10
  IMPORTANCE: /^([1-9]|10)$/,
} as const;

// ============================================================================
// HTTP STATUS CODES
// ============================================================================

export const HTTP_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// ============================================================================
// LOCAL STORAGE KEYS
// ============================================================================

export const STORAGE_KEYS = {
  TIMELINE_ZOOM: 'timeline_zoom',
  TIMELINE_PAN: 'timeline_pan',
  TIMELINE_FILTER: 'timeline_filter',
  TIMELINE_SORT: 'timeline_sort',
  TIMELINE_CACHE: 'timeline_cache',
  USER_PREFERENCES: 'timeline_preferences',
  LAST_VISITED: 'timeline_last_visited',
} as const;
