export type UserRole = 'MASTER' | 'ADMIN' | 'PASTOR' | 'MEMBER';

export interface User {
  id: string;
  tenantId: string;
  authId: string;
  role: UserRole;
  name: string;
  email: string;
  lastLoginAt: string;
  points: number;
}

export interface Sermon {
  id: string;
  tenantId: string;
  title: string;
  series: string;
  speaker: string;
  date: string;
  mp3Url: string;
  transcript: string;
  status: 'DRAFT' | 'READY_FOR_REVIEW' | 'APPROVED' | 'PUBLISHED';
  languages: string[];
  createdAt: string;
  updatedAt: string;
  weeklyContentId?: string;
}

export interface WeeklyContent {
  id: string;
  tenantId: string;
  sermonId: string;
  themeImageUrl: string;
  summaryShort: string;
  summaryLong: string;
  devotionals: { day: string; content: string }[];
  mondayClipUrl?: string;
}

export interface Game {
    id: string;
    sermonId: string;
    type: 'quiz' | 'flashcards' | 'wordsearch' | 'matching';
    title: string;
    audience: 'Youth' | 'Adults';
}

export interface ReflectionQuestionGroup {
    id: string;
    sermonId: string;
    audience: 'Youth' | 'Families' | 'Small Groups' | 'Individuals';
    questions: string[];
}
