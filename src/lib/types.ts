
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
  translatedTranscript?: string;
  status: 'DRAFT' | 'READY_FOR_REVIEW' | 'APPROVED' | 'PUBLISHED';
  languages: string[];
  createdAt: string;
  updatedAt: string;
  weeklyContentId?: string;
}

export interface ReflectionQuestionGroup {
  audience: 'Individuals' | 'Families' | 'Small Groups' | 'Youth';
  questions: string[];
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

export interface Game {
    type: 'Quiz' | 'Word Search' | 'Fill in the Blank' | 'Matching' | 'Word Guess' | 'Wordle';
    title: string;
    audience: 'Youth' | 'Adults';
    data: GameQuestion[] | { words: string[] } | FillInTheBlankItem | MatchingGameItem[] | WordGuessItem | WordleItem;
}

export interface WeeklyContent {
  id: string;
  tenantId: string;
  sermonId: string;
  summaryShort: string;
  summaryLong: string;
  devotionals: { day: string; content: string }[];
  reflectionQuestions: ReflectionQuestionGroup[];
  games: Game[];
  mondayClipUrl?: string;
}
