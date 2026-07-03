/**
 * Timeline Module - Type Definitions
 * خط‌زمان تکنولوژی - تعریف انواع
 */

// ============================================================================
// DATABASE MODELS
// ============================================================================

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  image: string | null;
  dateGr: Date | string;
  dateFa: string;
  year: number;
  yearFa: number;
  importance: number; // 1-10
  tags: string[];
  published: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  comments?: TimelineComment[];
  likes?: TimelineLike[];
}

export interface TimelineComment {
  id: string;
  eventId: string;
  parentId: string | null;
  authorName: string;
  text: string;
  likes: number;
  dislikes: number;
  createdAt: Date | string;
  event?: TimelineEvent;
  parent?: TimelineComment | null;
  replies?: TimelineComment[];
  votes?: TimelineCommentVote[];
}

export interface TimelineCommentVote {
  id: string;
  fingerprint: string;
  commentId: string;
  vote: number; // +1 or -1
  comment?: TimelineComment;
}

export interface TimelineLike {
  id: string;
  fingerprint: string;
  eventId: string;
  event?: TimelineEvent;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateTimelineEventRequest {
  title: string;
  description: string;
  image?: string | null;
  dateGr: string; // YYYY-MM-DD
  dateFa: string; // YYYY/MM/DD
  year: number;
  yearFa: number;
  importance?: number;
  tags?: string[];
  published?: boolean;
}

export interface UpdateTimelineEventRequest extends CreateTimelineEventRequest {
  id?: string;
}

export interface TimelineEventResponse extends TimelineEvent {
  _links?: {
    self: string;
    edit: string;
    delete: string;
  };
}

export interface TimelineEventListResponse {
  data: TimelineEvent[];
  count: number;
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiError {
  error: string;
  message: string;
  status: number;
  timestamp: string;
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface TimelineCardProps {
  event: TimelineEvent;
  onLike?: (eventId: string) => void;
  onComment?: (eventId: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export interface TimelineContainerProps {
  events: TimelineEvent[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  minZoom?: number;
  maxZoom?: number;
}

export interface TimelineLoadingProps {
  message?: string;
}

export interface TimelineErrorProps {
  error: string;
  onRetry?: () => void;
}

export interface TimelineEventFormProps {
  event?: TimelineEvent | null;
  onClose: () => void;
  onSuccess?: (event: TimelineEvent) => void;
  onError?: (error: string) => void;
  isLoading?: boolean;
}

// ============================================================================
// HOOK STATE TYPES
// ============================================================================

export interface UseTimelineEventsState {
  events: TimelineEvent[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseTimelineZoomState {
  zoom: number;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setZoom: (zoom: number) => void;
}

export interface UsePanState {
  pan: { x: number; y: number };
  isDragging: boolean;
  startPanning: (e: React.MouseEvent) => void;
  stopPanning: () => void;
  handlePan: (e: React.MouseEvent) => void;
  resetPan: () => void;
  setPan: (pan: { x: number; y: number }) => void;
}

export interface UseTimelineFormState {
  formData: CreateTimelineEventRequest;
  isLoading: boolean;
  error: string | null;
  setFormData: (data: Partial<CreateTimelineEventRequest>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  resetForm: () => void;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface JalaliDate {
  year: number;
  month: number;
  day: number;
}

export interface GregorianDate {
  year: number;
  month: number;
  day: number;
}

export interface TimelineConfig {
  PIXELS_PER_YEAR: number;
  MIN_ZOOM: number;
  MAX_ZOOM: number;
  CARD_SIZES: {
    small: string;
    medium: string;
    large: string;
    xlarge: string;
  };
  ANIMATION_DURATION: number;
  PAN_SPEED: number;
  ZOOM_SPEED: number;
}

export interface TimelineStats {
  totalEvents: number;
  publishedEvents: number;
  totalComments: number;
  totalLikes: number;
  yearRange: {
    start: number;
    end: number;
  };
  importanceDistribution: Record<number, number>;
}

// ============================================================================
// FILTER & SEARCH TYPES
// ============================================================================

export interface TimelineFilter {
  yearStart?: number;
  yearEnd?: number;
  importance?: number[];
  tags?: string[];
  published?: boolean;
  search?: string;
  sortBy?: 'date' | 'importance' | 'created' | 'updated';
  sortOrder?: 'asc' | 'desc';
}

export interface TimelineSearchResult {
  events: TimelineEvent[];
  count: number;
  query: string;
  filters: TimelineFilter;
}

// ============================================================================
// FORM VALIDATION TYPES
// ============================================================================

export interface FormValidationError {
  field: string;
  message: string;
  code: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: FormValidationError[];
}

export interface FieldValidator {
  field: string;
  type: 'string' | 'number' | 'date' | 'array' | 'boolean';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

// ============================================================================
// EVENT HANDLING TYPES
// ============================================================================

export type TimelineEventType = 
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LIKE'
  | 'UNLIKE'
  | 'COMMENT'
  | 'REPLY'
  | 'VOTE';

export interface TimelineEventLog {
  id: string;
  type: TimelineEventType;
  eventId: string;
  userId?: string;
  fingerprint: string;
  timestamp: Date;
  details?: Record<string, any>;
}

export interface TimelineNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ============================================================================
// PAGINATION & LISTING TYPES
// ============================================================================

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// ============================================================================
// EXPORT & IMPORT TYPES
// ============================================================================

export interface TimelineExportFormat {
  format: 'json' | 'csv' | 'pdf';
  includeComments?: boolean;
  includeLikes?: boolean;
  dateFormat?: 'gregorian' | 'jalali' | 'both';
}

export interface TimelineImportData {
  events: TimelineEvent[];
  comments?: TimelineComment[];
  likes?: TimelineLike[];
  conflicts?: 'skip' | 'overwrite' | 'merge';
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface EventAnalytics {
  eventId: string;
  views: number;
  likes: number;
  comments: number;
  engagement: number; // 0-100
  lastViewed?: Date;
  trending: boolean;
}

export interface TimelineAnalytics {
  totalViews: number;
  totalEngagement: number;
  mostViewed: TimelineEvent[];
  mostEngaging: TimelineEvent[];
  trendings: TimelineEvent[];
  periodStats: Record<string, EventAnalytics>;
}

// ============================================================================
// ANIMATION TYPES
// ============================================================================

export interface AnimationConfig {
  duration: number;
  delay?: number;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  repeat?: boolean;
  repeatDelay?: number;
}

export interface CardAnimationState {
  entering: boolean;
  exiting: boolean;
  position: { x: number; y: number };
  opacity: number;
  scale: number;
}

// ============================================================================
// LOCALIZATION TYPES
// ============================================================================

export type Language = 'en' | 'fa' | 'ar';

export interface LocalizationStrings {
  [key: string]: string | LocalizationStrings;
}

export interface TimelineLocalization {
  newEvent: string;
  title: string;
  description: string;
  date: string;
  importance: string;
  tags: string;
  image: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  loading: string;
  error: string;
  success: string;
  noEvents: string;
}

// ============================================================================
// ACCESSIBILITY TYPES
// ============================================================================

export interface A11yProps {
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaLive?: 'polite' | 'assertive' | 'off';
  role?: string;
  tabIndex?: number;
}

export interface KeyboardShortcuts {
  [key: string]: () => void;
}
