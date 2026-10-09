export type BookType = 'pdf' | 'audio';

export interface Book {
  id: string;
  title: string;
  author: string;
  type: BookType;
  url: string;
  totalUnits: number; // pages for PDF, minutes for audio
  summary: string;
  coverKey?: string;
  customCover?: string;
  tags?: string[];
  suggestedOrder?: number;
}

export interface BookProgress {
  currentUnit: number;
  isCompleted: boolean;
  completedDate?: string;
  rating: number; // 0 to 5
  readingType: string;
  recommendation: string;
  notes: string;
  startedDate?: string;
  lastReadDate?: string;
}

export interface ReadingLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  bookId: string;
  units: number; // delta
  type: BookType;
  timestamp: number;
}

export type TabType = 'home' | 'books' | 'pomodoro' | 'stats' | 'apoio';

export type BookFilter = 'all' | 'pdf' | 'audio' | 'reading' | 'completed' | 'queued';

export interface AppState {
  progressMap: Record<string, BookProgress>;
  customBooks: Book[];
  customTotals: Record<string, number>;
  readingLogs: ReadingLogEntry[];
  pomodoroLogs: Record<string, number>; // date -> seconds
  dailyGoalMinutes: number; // default 25
  theme: 'light' | 'dark' | 'system';
}
