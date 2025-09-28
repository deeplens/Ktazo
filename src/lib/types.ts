

export type UserRole = 'MASTER' | 'ADMIN' | 'PASTOR' | 'MEMBER';

export interface User {
  id: string;
  tenantId: string;
  authId: string;
  role: UserRole;
  name: string;
  email: string;
  photoUrl?: string;
  lastLoginAt: string;
  points: number;
}

export interface Sermon {
  id:string;
  tenantId: string;
  title: string;
  series: string;
  speaker: string;
  date: string;
  mp3Url: string;
  transcript: string;
  translatedTranscript?: string;
  artworkUrl?: string;
  status: 'DRAFT' | 'READY_FOR_REVIEW' | 'APPROVED' | 'PUBLISHED';
  languages: string[];
  createdAt: string;
  updatedAt: string;
  weeklyContentIds?: { [key: string]: string };
}

export interface ReflectionQuestionGroup {
  audience: 'Individuals' | 'Families' | 'Small Groups' | 'Youth';
  questions: string[];
}

export interface ReflectionAnswer {
  id: string;
  userId: string;
  sermonId: string;
  answers: Record<string, string>;
}

export interface GameQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
}

export interface MatchingGameItem {
    id: number;
    term: string;
    definition: string;
}

export interface FillInTheBlankItem {
    sentence: string;
    blank: string;
}

export interface WordGuessItem {
    word: string;
    hint: string;
}

export interface WordleItem {
    word: string;
}

export interface JeopardyQuestion {
    question: string;
    answer: string;
    points: number;
}

export interface JeopardyCategory {
    title: string;
    questions: JeopardyQuestion[];
}

export interface VerseScrambleItem {
    verse: string;
    reference: string;
}

export interface TrueFalseQuestion {
    statement: string;
    isTrue: boolean;
}

export interface Game {
    type: 'Quiz' | 'Word Search' | 'Fill in the Blank' | 'Matching' | 'Word Guess' | 'Wordle' | 'Jeopardy' | 'Verse Scramble' | 'True/False' | 'Word Cloud Hunt' | 'Reflection Roulette';
    title: string;
    audience: 'Youth' | 'Adults';
    data: GameQuestion[] | { words: string[] } | FillInTheBlankItem[] | MatchingGameItem[] | WordGuessItem[] | WordleItem | JeopardyCategory[] | VerseScrambleItem | TrueFalseQuestion[] | {};
}

export interface BibleReadingPlanItem {
    theme: string;
    passages: {
        reference: string;
        explanation: string;
    }[];
}

export interface SpiritualPractice {
    title: string;
    description: string;
}

export interface OutwardFocusItem {
    title: string;
    description: string;
    details: string;
}

export interface WeeklyContent {
  id: string;
  tenantId: string;
  sermonId: string;
  language: string;
  summaryShort: string;
  summaryLong: string;
  oneLiners: {
    tuesday: string;
    thursday: string;
  };
  sendOneLiners: boolean;
  devotionals: { day: string; content: string }[];
  reflectionQuestions: ReflectionQuestionGroup[];
  games: Game[];
  bibleReadingPlan: BibleReadingPlanItem[];
  spiritualPractices: SpiritualPractice[];
  outwardFocus: {
      missionFocus: OutwardFocusItem;
      serviceChallenge: OutwardFocusItem;
      culturalEngagement: OutwardFocusItem;
  };
  mondayClipUrl?: string;
}

export interface TenantSettings {
    optionalServices: {
        ourDailyBread: boolean;
    };
    notifications: {
        oneLiners: {
            enabled: boolean;
            sendByEmail: boolean;
            sendBySms: boolean;
            audience: 'all' | 'members_and_regulars' | 'members_only';
        };
        suspendDuringBackfill: boolean;
    }
}

export interface Missionary {
    id: string;
    name: string;
    location: string;
    bio: string;
    summary: string;
    prayerRequests: string[];
}

export interface PrayerRequest {
    id: string;
    userId: string;
    userName: string;
    userPhotoUrl?: string;
    sermonId: string;
    requestText: string;
    createdAt: string;
}
    
