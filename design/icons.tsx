/* ════════════════════════════════════════════════════════════════════════
   TECHBOX · CENTRAL ICON SYSTEM
   ────────────────────────────────────────────────────────────────────────
   The single source of truth for every icon/emoji used across the site.
   Components must import icons from here (never emojis or ad-hoc imports),
   so the whole icon set can be swapped in one place.

   Usage:
     import { Icon } from "@/design/icons";
     <Icon name="like" className="h-4 w-4" />
   or the named component:
     import { LikeIcon } from "@/design/icons";
     <LikeIcon size={16} />
   ════════════════════════════════════════════════════════════════════════ */

import {
  Heart,
  Eye,
  MessageCircle,
  Download,
  Star,
  Play,
  Clock,
  Calendar,
  Bell,
  Search,
  ShoppingCart,
  ShieldCheck,
  Headset,
  MessageSquare,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Moon,
  Sun,
  Plus,
  Minus,
  Check,
  User,
  Users,
  Tag,
  Newspaper,
  Video,
  Wrench,
  FolderDown,
  Store,
  MessagesSquare,
  BookOpen,
  Home,
  Flame,
  Send,
  HardDrive,
  Server,
  Database,
  Cctv,
  FileText,
  History,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

/** Canonical icon registry. Add new icons here and reference them by name. */
export const icons = {
  // engagement / meta
  like: Heart,
  view: Eye,
  comment: MessageCircle,
  download: Download,
  star: Star,
  play: Play,
  clock: Clock,
  date: Calendar,
  tag: Tag,
  flame: Flame,
  send: Send,
  // navigation / chrome
  bell: Bell,
  search: Search,
  cart: ShoppingCart,
  shield: ShieldCheck,
  headset: Headset,
  chat: MessageSquare,
  close: X,
  chevronDown: ChevronDown,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronUp: ChevronUp,
  moon: Moon,
  sun: Sun,
  plus: Plus,
  minus: Minus,
  check: Check,
  user: User,
  users: Users,
  home: Home,
  // module glyphs
  blog: BookOpen,
  news: Newspaper,
  media: Video,
  tools: Wrench,
  downloadModule: FolderDown,
  shop: Store,
  forum: MessagesSquare,
  review: Star,
  // hardware (raid / subnet visuals)
  disk: HardDrive,
  file: FileText,
  server: Server,
  nas: Database,
  nvr: Cctv,
  timeline: History,
} as const;

export type IconName = keyof typeof icons;

/** Generic icon component: <Icon name="like" className="h-4 w-4" /> */
export function Icon({ name, ...props }: { name: IconName } & LucideProps) {
  const Cmp = icons[name] as LucideIcon;
  return <Cmp {...props} />;
}

// Convenience named exports (used where a direct component is cleaner)
export const LikeIcon = Heart;
export const ViewIcon = Eye;
export const CommentIcon = MessageCircle;
export const DownloadIcon = Download;
export const StarIcon = Star;
export const PlayIcon = Play;
export const ClockIcon = Clock;
export const DateIcon = Calendar;
export const TagIcon = Tag;
export const ChatIcon = MessageSquare;
export const CloseIcon = X;
export const ChevronLeftIcon = ChevronLeft;
export const ChevronRightIcon = ChevronRight;
export const PlusIcon = Plus;
export const MinusIcon = Minus;
export const DiskIcon = HardDrive;
export const ServerIcon = Server;
export const NasIcon = Database;
export const NvrIcon = Cctv;
export const TimelineIcon = History;

export type { LucideProps };
