import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { Book, BookProgress, ReadingLogEntry, AppState } from '../types';

export interface UserProfileData {
  displayName?: string;
  email: string;
  photoURL?: string;
  dailyGoalMinutes?: number;
  updatedAt?: string;
}

// Save/Update user profile
export async function syncUserProfile(userId: string, profile: UserProfileData): Promise<void> {
  if (!userId) return;
  const path = `users/${userId}`;
  try {
    const payload: Record<string, any> = {
      email: profile.email || '',
      displayName: (profile.displayName || '').slice(0, 256),
      photoURL: (profile.photoURL || '').slice(0, 2048),
      dailyGoalMinutes: typeof profile.dailyGoalMinutes === 'number' ? profile.dailyGoalMinutes : 25,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', userId), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Load user profile
export async function loadUserProfile(userId: string): Promise<UserProfileData | null> {
  if (!userId) return null;
  const path = `users/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) {
      return snap.data() as UserProfileData;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// Save book progress for user
export async function saveUserBookToCloud(
  userId: string,
  bookId: string,
  progress: BookProgress,
  bookMeta?: Partial<Book>
): Promise<void> {
  if (!userId || !bookId) return;
  const path = `users/${userId}/books/${bookId}`;
  try {
    const payload = {
      bookId,
      currentUnit: Math.max(0, Number(progress.currentUnit) || 0),
      isCompleted: Boolean(progress.isCompleted),
      completedDate: (progress.completedDate || '').slice(0, 64),
      rating: Number(progress.rating) || 0,
      readingType: (progress.readingType || '').slice(0, 64),
      recommendation: (progress.recommendation || '').slice(0, 128),
      notes: (progress.notes || '').slice(0, 50000),
      totalUnits: Math.max(1, Number(bookMeta?.totalUnits) || 100),
      title: (bookMeta?.title || '').slice(0, 500),
      author: (bookMeta?.author || '').slice(0, 500),
      type: bookMeta?.type === 'audio' ? 'audio' : 'pdf',
      url: (bookMeta?.url || '').slice(0, 2048),
      isCustom: Boolean(bookId.startsWith('custom-')),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', userId, 'books', bookId), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Load all user books & progress from cloud
export async function loadUserBooksFromCloud(
  userId: string
): Promise<{ progressMap: Record<string, BookProgress>; customBooks: Book[]; customTotals: Record<string, number> }> {
  if (!userId) return { progressMap: {}, customBooks: [], customTotals: {} };
  const path = `users/${userId}/books`;
  try {
    const querySnapshot = await getDocs(collection(db, 'users', userId, 'books'));
    const progressMap: Record<string, BookProgress> = {};
    const customBooks: Book[] = [];
    const customTotals: Record<string, number> = {};

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const bId = docSnap.id;

      progressMap[bId] = {
        currentUnit: Number(data.currentUnit) || 0,
        isCompleted: Boolean(data.isCompleted),
        completedDate: data.completedDate || '',
        rating: Number(data.rating) || 0,
        readingType: data.readingType || '',
        recommendation: data.recommendation || '',
        notes: data.notes || '',
      };

      if (data.totalUnits) {
        customTotals[bId] = Number(data.totalUnits);
      }

      if (data.isCustom && data.title) {
        customBooks.push({
          id: bId,
          title: data.title,
          author: data.author || 'Autor não informado',
          type: data.type === 'audio' ? 'audio' : 'pdf',
          url: data.url || '#',
          totalUnits: Number(data.totalUnits) || 100,
          summary: data.summary || data.notes || 'Obra adicionada pelo usuário.',
        });
      }
    });

    return { progressMap, customBooks, customTotals };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// Save reading log entry
export async function saveReadingLogToCloud(userId: string, log: ReadingLogEntry): Promise<void> {
  if (!userId || !log) return;
  const logId = (log.id && log.id.trim()) ? log.id : `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const path = `users/${userId}/readingLogs/${logId}`;
  try {
    await setDoc(doc(db, 'users', userId, 'readingLogs', logId), {
      date: (log.date || new Date().toISOString().split('T')[0]).slice(0, 32),
      bookId: (log.bookId || 'general').slice(0, 128),
      units: Number(log.units) || 0,
      type: (log.type || 'pdf').slice(0, 32),
      timestamp: Number(log.timestamp) || Date.now(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Load user reading logs
export async function loadReadingLogsFromCloud(userId: string): Promise<ReadingLogEntry[]> {
  if (!userId) return [];
  const path = `users/${userId}/readingLogs`;
  try {
    const querySnapshot = await getDocs(collection(db, 'users', userId, 'readingLogs'));
    const logs: ReadingLogEntry[] = [];
    querySnapshot.forEach((docSnap) => {
      const d = docSnap.data();
      logs.push({
        id: docSnap.id,
        date: d.date || '',
        bookId: d.bookId || '',
        units: Number(d.units) || 0,
        type: d.type || 'pdf',
        timestamp: Number(d.timestamp) || Date.now(),
      });
    });
    return logs.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// Save Pomodoro daily focus time
export async function savePomodoroToCloud(userId: string, date: string, seconds: number): Promise<void> {
  if (!userId || !date) return;
  const path = `users/${userId}/pomodoroLogs/${date}`;
  try {
    await setDoc(
      doc(db, 'users', userId, 'pomodoroLogs', date),
      {
        date: date.slice(0, 32),
        seconds: Number(seconds) || 0,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Load Pomodoro logs
export async function loadPomodoroLogsFromCloud(userId: string): Promise<Record<string, number>> {
  if (!userId) return {};
  const path = `users/${userId}/pomodoroLogs`;
  try {
    const querySnapshot = await getDocs(collection(db, 'users', userId, 'pomodoroLogs'));
    const logs: Record<string, number> = {};
    querySnapshot.forEach((docSnap) => {
      const d = docSnap.data();
      if (d.date && typeof d.seconds === 'number') {
        logs[d.date] = d.seconds;
      }
    });
    return logs;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// Migrate entire local state into Firestore upon first login with resilient per-item handling
export async function syncLocalStateToCloud(userId: string, localState: AppState, allBooks: Book[]): Promise<void> {
  if (!userId) return;

  // 1. Sync profile
  try {
    await syncUserProfile(userId, {
      email: auth.currentUser?.email || '',
      displayName: auth.currentUser?.displayName || '',
      photoURL: auth.currentUser?.photoURL || '',
      dailyGoalMinutes: localState.dailyGoalMinutes || 25,
    });
  } catch (err) {
    console.warn('Profile sync non-blocking warning:', err);
  }

  // 2. Sync books
  const booksToSync = [...allBooks, ...(localState.customBooks || [])];
  for (const b of booksToSync) {
    const prog = localState.progressMap[b.id];
    if (prog && (prog.currentUnit > 0 || prog.isCompleted || prog.rating > 0 || prog.notes)) {
      try {
        await saveUserBookToCloud(userId, b.id, prog, {
          totalUnits: localState.customTotals[b.id] || b.totalUnits,
          title: b.title,
          author: b.author,
          type: b.type,
          url: b.url,
        });
      } catch (err) {
        console.warn(`Book sync non-blocking warning for ${b.id}:`, err);
      }
    }
  }

  // 3. Sync reading logs
  if (Array.isArray(localState.readingLogs)) {
    for (const log of localState.readingLogs.slice(0, 50)) {
      try {
        await saveReadingLogToCloud(userId, log);
      } catch (err) {
        console.warn('Reading log sync non-blocking warning:', err);
      }
    }
  }

  // 4. Sync pomodoro logs
  if (localState.pomodoroLogs) {
    for (const date in localState.pomodoroLogs) {
      try {
        await savePomodoroToCloud(userId, date, localState.pomodoroLogs[date]);
      } catch (err) {
        console.warn(`Pomodoro sync non-blocking warning for ${date}:`, err);
      }
    }
  }
}
