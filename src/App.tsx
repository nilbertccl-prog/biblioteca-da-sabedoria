import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Book, BookProgress, ReadingLogEntry, TabType, AppState } from './types';
import { INITIAL_BOOKS } from './data/initialBooks';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { BookCarousel } from './components/BookCarousel';
import { HomeDashboard } from './components/HomeDashboard';
import { LibraryView } from './components/LibraryView';
import { PomodoroSection } from './components/PomodoroSection';
import { StatsView } from './components/StatsView';
import { ApoioView } from './components/ApoioView';
import { LoginModal } from './components/LoginModal';
import { Footer } from './components/Footer';
import { getTodayIso } from './utils/stats';
import { playChime } from './utils/sound';
import {
  saveUserBookToCloud,
  saveReadingLogToCloud,
  savePomodoroToCloud,
  loadUserBooksFromCloud,
  loadReadingLogsFromCloud,
  loadPomodoroLogsFromCloud,
  syncLocalStateToCloud,
  loadUserProfile,
} from './lib/firestoreService';
import { ShieldCheck, Cloud, LogIn, Check, AlertCircle } from 'lucide-react';

const STORAGE_KEY = 'biblioteca_sabedoria_v2';
const LEGACY_KEY = 'biblioteca_sabedoria_v1';

function AppContent() {
  const { currentUser, loading: authLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme_preference');
      if (savedTheme) return savedTheme === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [customBooks, setCustomBooks] = useState<Book[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, BookProgress>>({});
  const [customTotals, setCustomTotals] = useState<Record<string, number>>({});
  const [readingLogs, setReadingLogs] = useState<ReadingLogEntry[]>([]);
  const [pomodoroLogs, setPomodoroLogs] = useState<Record<string, number>>({});
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState<number>(25);
  const [activePomodoroBookId, setActivePomodoroBookId] = useState<string | null>(null);

  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Initialize and migrate from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.progressMap) setProgressMap(parsed.progressMap);
        if (parsed.customBooks) setCustomBooks(parsed.customBooks);
        if (parsed.customTotals) setCustomTotals(parsed.customTotals);
        if (parsed.readingLogs) setReadingLogs(parsed.readingLogs);
        if (parsed.pomodoroLogs) setPomodoroLogs(parsed.pomodoroLogs);
        if (parsed.dailyGoalMinutes) setDailyGoalMinutes(parsed.dailyGoalMinutes);
        return;
      }

      // Check legacy v1 format from user's attached file
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy) {
        const old = JSON.parse(legacy);
        const newProgress: Record<string, BookProgress> = {};
        if (old.b) {
          for (const id in old.b) {
            const item = old.b[id];
            newProgress[id] = {
              currentUnit: item.p || 0,
              isCompleted: !!item.done,
              completedDate: item.fin || (item.done ? getTodayIso() : undefined),
              rating: item.r || 0,
              readingType: item.kind || '',
              recommendation: item.rec || '',
              notes: item.note || '',
            };
          }
        }
        setProgressMap(newProgress);

        if (old.tot) setCustomTotals(old.tot);
        if (old.extra) setCustomBooks(old.extra);
        if (old.pomo) setPomodoroLogs(old.pomo);
        if (Array.isArray(old.log)) {
          setReadingLogs(
            old.log.map((l: { d: string; id: string; p: number; k: 'pdf' | 'audio' }, i: number) => ({
              id: `migrated-${i}`,
              date: l.d,
              bookId: l.id,
              units: l.p,
              type: l.k || 'pdf',
              timestamp: Date.now() - i * 1000,
            }))
          );
        }
      }
    } catch (e) {
      console.error('Error loading stored state:', e);
    }
  }, []);

  // Sync with Firestore when user logs in or requests manual sync
  const handleSyncUserData = useCallback(async (isInitial = false) => {
    if (!currentUser) return;

    setIsSyncing(true);
    setSyncError(null);
    try {
      // Load cloud data for this user
      const cloudProfile = await loadUserProfile(currentUser.uid);
      const cloudBooks = await loadUserBooksFromCloud(currentUser.uid);
      const cloudLogs = await loadReadingLogsFromCloud(currentUser.uid);
      const cloudPomodoro = await loadPomodoroLogsFromCloud(currentUser.uid);

      const hasCloudData =
        (cloudBooks && Object.keys(cloudBooks.progressMap).length > 0) ||
        (cloudLogs && cloudLogs.length > 0) ||
        (cloudPomodoro && Object.keys(cloudPomodoro).length > 0);

      if (hasCloudData) {
        // Merge cloud data
        if (cloudBooks?.progressMap) {
          setProgressMap((prev) => ({ ...prev, ...cloudBooks.progressMap }));
        }
        if (cloudBooks?.customBooks && cloudBooks.customBooks.length > 0) {
          setCustomBooks(cloudBooks.customBooks);
        }
        if (cloudBooks?.customTotals) {
          setCustomTotals((prev) => ({ ...prev, ...cloudBooks.customTotals }));
        }
        if (cloudLogs && cloudLogs.length > 0) {
          setReadingLogs(cloudLogs);
        }
        if (cloudPomodoro) {
          setPomodoroLogs((prev) => ({ ...prev, ...cloudPomodoro }));
        }
        if (cloudProfile?.dailyGoalMinutes) {
          setDailyGoalMinutes(cloudProfile.dailyGoalMinutes);
        }
      } else {
        // First time login with local data: push existing local state to user's Firestore
        const currentState: AppState = {
          progressMap,
          customBooks,
          customTotals,
          readingLogs,
          pomodoroLogs,
          dailyGoalMinutes,
          theme: isDark ? 'dark' : 'light',
        };
        await syncLocalStateToCloud(currentUser.uid, currentState, INITIAL_BOOKS);
      }

      setSyncFeedback(`Dados de ${currentUser.displayName || currentUser.email} sincronizados com sucesso no Firebase.`);
      setSyncError(null);
      setTimeout(() => setSyncFeedback(null), 4000);
    } catch (err: any) {
      console.warn('Sync cloud user data notice:', err);
      if (!isInitial) {
        setSyncError('Não foi possível sincronizar todos os dados no Firebase. Seus dados estão salvos localmente.');
      }
    } finally {
      setIsSyncing(false);
    }
  }, [currentUser, progressMap, customBooks, customTotals, readingLogs, pomodoroLogs, dailyGoalMinutes, isDark]);

  useEffect(() => {
    if (!currentUser) return;
    handleSyncUserData(true);
  }, [currentUser]);

  // Save local state to localStorage as cache
  useEffect(() => {
    try {
      const stateToSave: AppState = {
        progressMap,
        customBooks,
        customTotals,
        readingLogs,
        pomodoroLogs,
        dailyGoalMinutes,
        theme: isDark ? 'dark' : 'light',
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Error saving state:', e);
    }
  }, [progressMap, customBooks, customTotals, readingLogs, pomodoroLogs, dailyGoalMinutes, isDark]);

  // Sync theme with HTML root class
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme_preference', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme_preference', 'light');
    }
  }, [isDark]);

  const allBooks = useMemo(() => {
    return [...INITIAL_BOOKS, ...customBooks];
  }, [customBooks]);

  const today = getTodayIso();
  const todayFocusSeconds = pomodoroLogs[today] || 0;

  // Handlers
  const handleToggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const handleUpdateProgress = useCallback(
    (bookId: string, newUnit: number) => {
      const book = allBooks.find((b) => b.id === bookId);
      if (!book) return;

      const total = customTotals[bookId] || book.totalUnits;
      const prevProg = progressMap[bookId] || {
        currentUnit: 0,
        isCompleted: false,
        rating: 0,
        readingType: '',
        recommendation: '',
        notes: '',
      };

      const clampedUnit = Math.max(0, Math.min(total, newUnit));
      const delta = clampedUnit - prevProg.currentUnit;

      // Log progress delta if advanced
      if (delta > 0) {
        const newLogEntry: ReadingLogEntry = {
          id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          date: today,
          bookId,
          units: delta,
          type: book.type,
          timestamp: Date.now(),
        };
        setReadingLogs((prev) => [newLogEntry, ...prev]);

        // Sync log to Firestore if user logged in
        if (currentUser) {
          saveReadingLogToCloud(currentUser.uid, newLogEntry).catch((e) =>
            console.error('Failed to sync log to Firestore:', e)
          );
        }
      }

      const isNowCompleted = clampedUnit >= total;
      if (isNowCompleted && !prevProg.isCompleted) {
        playChime('success');
      }

      const updatedProgress: BookProgress = {
        ...prevProg,
        currentUnit: clampedUnit,
        isCompleted: isNowCompleted,
        completedDate: isNowCompleted ? prevProg.completedDate || today : '',
        lastReadDate: today,
        startedDate: prevProg.startedDate || today,
      };

      setProgressMap((prev) => ({
        ...prev,
        [bookId]: updatedProgress,
      }));

      // Sync book to Firestore if user logged in
      if (currentUser) {
        saveUserBookToCloud(currentUser.uid, bookId, updatedProgress, {
          totalUnits: total,
          title: book.title,
          author: book.author,
          type: book.type,
          url: book.url,
        }).catch((e) => console.error('Failed to sync book to Firestore:', e));
      }
    },
    [allBooks, customTotals, progressMap, today, currentUser]
  );

  const handleComplete = useCallback(
    (bookId: string) => {
      const book = allBooks.find((b) => b.id === bookId);
      if (!book) return;
      const total = customTotals[bookId] || book.totalUnits;
      handleUpdateProgress(bookId, total);
    },
    [allBooks, customTotals, handleUpdateProgress]
  );

  const handleReopen = useCallback(
    (bookId: string) => {
      const book = allBooks.find((b) => b.id === bookId);
      if (!book) return;
      const total = customTotals[bookId] || book.totalUnits;
      const prevProg = progressMap[bookId] || {
        currentUnit: 0,
        isCompleted: false,
        rating: 0,
        readingType: '',
        recommendation: '',
        notes: '',
      };

      const reopened: BookProgress = {
        ...prevProg,
        currentUnit: Math.max(0, total - 1),
        isCompleted: false,
        completedDate: '',
      };

      setProgressMap((prev) => ({
        ...prev,
        [bookId]: reopened,
      }));

      if (currentUser) {
        saveUserBookToCloud(currentUser.uid, bookId, reopened, {
          totalUnits: total,
          title: book.title,
        }).catch((e) => console.error('Failed to sync reopen to Firestore:', e));
      }
    },
    [allBooks, customTotals, progressMap, currentUser]
  );

  const handleUpdateMetadata = useCallback(
    (bookId: string, updates: Partial<BookProgress>) => {
      const book = allBooks.find((b) => b.id === bookId);
      const current = progressMap[bookId] || {
        currentUnit: 0,
        isCompleted: false,
        rating: 0,
        readingType: '',
        recommendation: '',
        notes: '',
      };

      const updated = {
        ...current,
        ...updates,
      };

      setProgressMap((prev) => ({
        ...prev,
        [bookId]: updated,
      }));

      if (currentUser) {
        saveUserBookToCloud(currentUser.uid, bookId, updated, {
          title: book?.title,
          totalUnits: customTotals[bookId] || book?.totalUnits,
        }).catch((e) => console.error('Failed to sync metadata to Firestore:', e));
      }
    },
    [allBooks, customTotals, progressMap, currentUser]
  );

  const handleUpdateTotalUnits = useCallback((bookId: string, newTotal: number) => {
    setCustomTotals((prev) => ({
      ...prev,
      [bookId]: Math.max(1, newTotal),
    }));
  }, []);

  const handleAddBook = (newBookData: Omit<Book, 'id'>) => {
    const id = `custom-${Date.now()}`;
    const newBook: Book = {
      ...newBookData,
      id,
    };
    setCustomBooks((prev) => [...prev, newBook]);
    setCurrentTab('books');

    if (currentUser) {
      saveUserBookToCloud(
        currentUser.uid,
        id,
        {
          currentUnit: 0,
          isCompleted: false,
          rating: 0,
          readingType: '',
          recommendation: '',
          notes: newBookData.summary || '',
        },
        newBook
      ).catch((e) => console.error('Failed to sync new book to Firestore:', e));
    }
  };

  const handleAddFocusTime = useCallback(
    (seconds: number) => {
      const todayStr = getTodayIso();
      const currentVal = pomodoroLogs[todayStr] || 0;
      const nextVal = currentVal + seconds;

      setPomodoroLogs((prev) => ({
        ...prev,
        [todayStr]: nextVal,
      }));

      // Throttle cloud updates every 15 seconds
      if (currentUser && Math.floor(nextVal / 15) > Math.floor(currentVal / 15)) {
        savePomodoroToCloud(currentUser.uid, todayStr, nextVal).catch((e) =>
          console.error('Failed to sync pomodoro to Firestore:', e)
        );
      }
    },
    [pomodoroLogs, currentUser]
  );

  const handleSelectBookFromCarousel = (bookId: string) => {
    setCurrentTab('books');
    setTimeout(() => {
      const el = document.getElementById(`book-${bookId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleStartPomodoroForBook = (book: Book) => {
    setActivePomodoroBookId(book.id);
    setCurrentTab('pomodoro');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRestoreState = (newState: AppState) => {
    if (newState.progressMap) setProgressMap(newState.progressMap);
    if (newState.customBooks) setCustomBooks(newState.customBooks);
    if (newState.customTotals) setCustomTotals(newState.customTotals);
    if (newState.readingLogs) setReadingLogs(newState.readingLogs);
    if (newState.pomodoroLogs) setPomodoroLogs(newState.pomodoroLogs);
    if (newState.dailyGoalMinutes) setDailyGoalMinutes(newState.dailyGoalMinutes);
    if (newState.theme) setIsDark(newState.theme === 'dark');

    if (currentUser) {
      syncLocalStateToCloud(currentUser.uid, newState, allBooks).catch((e) =>
        console.error('Failed to sync restored state to Firestore:', e)
      );
    }
  };

  const currentAppState: AppState = {
    progressMap,
    customBooks,
    customTotals,
    readingLogs,
    pomodoroLogs,
    dailyGoalMinutes,
    theme: isDark ? 'dark' : 'light',
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-ink)] selection:bg-[var(--brand-ac)]/20">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        activeFocusMinutesToday={Math.round(todayFocusSeconds / 60)}
        dailyGoalMinutes={dailyGoalMinutes}
        onOpenLoginModal={() => setShowLoginModal(true)}
        isSyncing={isSyncing}
        onSyncNow={() => handleSyncUserData(false)}
      />

      {/* Sync feedback notification */}
      {syncFeedback && (
        <div className="bg-emerald-700 text-white text-xs px-4 py-2 flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300">
          <Check className="w-4 h-4" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* Sync error notification */}
      {syncError && (
        <div className="bg-amber-600 dark:bg-amber-700 text-white text-xs px-4 py-2 flex items-center justify-between gap-2 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{syncError}</span>
          </div>
          <button
            onClick={() => handleSyncUserData(false)}
            className="px-2.5 py-1 bg-black/20 hover:bg-black/30 rounded text-white font-medium text-[11px] transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Not Logged In Banner */}
      {!currentUser && !authLoading && (
        <div className="bg-[var(--bg-card)] border-b border-[var(--border-ln)] px-4 py-2.5 text-xs">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <div className="flex items-center gap-2 text-[var(--text-mut)]">
              <ShieldCheck className="w-4 h-4 text-[var(--brand-ac)] shrink-0" />
              <span>
                <strong>Proteja seus dados:</strong> Faça login com o Google usando o Firebase Auth para sincronizar seus livros e notas na nuvem.
              </span>
            </div>
            <button
              onClick={() => setShowLoginModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 font-semibold rounded-md bg-[var(--brand-ac)] hover:bg-[var(--brand-ac-hover)] text-white transition-colors shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign in with Google</span>
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Cover Carousel */}
        <BookCarousel
          books={allBooks}
          progressMap={progressMap}
          customTotals={customTotals}
          onSelectBook={handleSelectBookFromCarousel}
        />

        {/* View Routing */}
        <div className="mt-8">
          {currentTab === 'home' && (
            <HomeDashboard
              books={allBooks}
              progressMap={progressMap}
              customTotals={customTotals}
              readingLogs={readingLogs}
              pomodoroLogs={pomodoroLogs}
              dailyGoalMinutes={dailyGoalMinutes}
              onGoToBook={handleSelectBookFromCarousel}
              onStartPomodoro={(bookId) => {
                if (bookId) setActivePomodoroBookId(bookId);
                setCurrentTab('pomodoro');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onGoToLibrary={() => {
                setCurrentTab('books');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {currentTab === 'books' && (
            <LibraryView
              books={allBooks}
              progressMap={progressMap}
              customTotals={customTotals}
              onUpdateProgress={handleUpdateProgress}
              onComplete={handleComplete}
              onReopen={handleReopen}
              onUpdateMetadata={handleUpdateMetadata}
              onUpdateTotalUnits={handleUpdateTotalUnits}
              onAddBook={handleAddBook}
              onStartPomodoroForBook={handleStartPomodoroForBook}
            />
          )}

          {currentTab === 'pomodoro' && (
            <PomodoroSection
              books={allBooks}
              activeBookId={activePomodoroBookId}
              onSelectActiveBook={setActivePomodoroBookId}
              todayFocusSeconds={todayFocusSeconds}
              dailyGoalMinutes={dailyGoalMinutes}
              onAddFocusTime={handleAddFocusTime}
            />
          )}

          {currentTab === 'stats' && (
            <StatsView
              books={allBooks}
              progressMap={progressMap}
              customTotals={customTotals}
              readingLogs={readingLogs}
              pomodoroLogs={pomodoroLogs}
            />
          )}

          {currentTab === 'apoio' && (
            <ApoioView
              appState={currentAppState}
              onRestoreState={handleRestoreState}
            />
          )}
        </div>
      </main>

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

      {/* Footer */}
      <Footer
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
