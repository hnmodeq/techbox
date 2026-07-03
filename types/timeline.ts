export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  image?: string | null;
  dateGr: Date;
  dateFa: string;
  year: number;
  yearFa: number;
  importance: number;
  tags: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  comments?: TimelineComment[];
  likes?: TimelineLike[];
}

export interface TimelineComment {
  id: string;
  eventId: string;
  parentId?: string | null;
  authorName: string;
  text: string;
  likes: number;
  dislikes: number;
  createdAt: Date;
  parent?: TimelineComment | null;
  replies?: TimelineComment[];
}

export interface TimelineLike {
  id: string;
  fingerprint: string;
  eventId: string;
}
