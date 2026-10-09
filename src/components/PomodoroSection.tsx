import React, { useState, useEffect, useRef } from 'react';
import { Book } from '../types';
import { playChime } from '../utils/sound';
import {
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Flame,
  CheckCircle2,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ExternalLink,
  BookOpen,
  Headphones,
} from 'lucide-react';
import { COVERS } from '../data/covers';

interface PomodoroSectionProps {
  books: Book[];
  activeBookId: string | null;
  onSelectActiveBook: (id: string | null) => void;
  todayFocusSeconds: number;
  dailyGoalMinutes: number;
  onAddFocusTime: (seconds: number) => void;
}

type Mode = 'focus' | 'shortBreak' | 'longBreak';

export const PomodoroSection: React.FC<PomodoroSectionProps> = ({
  books,
  activeBookId,
  onSelectActiveBook,
  todayFocusSeconds,
  dailyGoalMinutes,
  onAddFocusTime,
}) => {
  const [mode, setMode] = useState<Mode>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const lastTimeRef = useRef<number>(Date.now());

  // Duration in seconds for each mode
  const durations: Record<Mode, number> = {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  const activeBook = books.find((b) => b.id === activeBookId);

  // Switch mode handler
  const handleSwitchMode = (newMode: Mode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(durations[newMode]);
  };

  // Reset timer
  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(durations[mode]);
  };

  // Toggle run
  const handleToggleRun = () => {
    if (!isRunning) {
      lastTimeRef.current = Date.now();
    }
    setIsRunning(!isRunning);
  };

  // Accurate timer ticker
  useEffect(() => {
    if (!isRunning) return;

    lastTimeRef.current = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const deltaSec = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      setTimeLeft((prev) => {
        const next = prev - deltaSec;
        if (mode === 'focus') {
          onAddFocusTime(deltaSec);
        }

        if (next <= 0) {
          if (soundEnabled) {
            playChime(mode === 'focus' ? 'bell' : 'tick');
          }
          setIsRunning(false);
          const nextMode: Mode = mode === 'focus' ? 'shortBreak' : 'focus';
          setMode(nextMode);
          return durations[nextMode];
        }
        return next;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isRunning, mode, soundEnabled, onAddFocusTime]);

  // Format MM:SS
  const formatTime = (secs: number) => {
    const s = Math.max(0, Math.ceil(secs));
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  // Daily goal calculation
  const todayFocusMinutes = Math.round(todayFocusSeconds / 60);
  const goalPercentage = Math.min(100, Math.round((todayFocusMinutes / dailyGoalMinutes) * 100));
  const isGoalReached = todayFocusMinutes >= dailyGoalMinutes;

  return (
    <div className={`space-y-6 ${isZenMode ? 'fixed inset-0 z-50 bg-[var(--bg-page)] p-6 flex flex-col justify-center max-w-4xl mx-auto overflow-y-auto' : ''}`}>
      {/* Zen Mode Header Bar */}
      {isZenMode && (
        <div className="flex items-center justify-between border-b border-[var(--border-ln)] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="font-serif-title font-bold text-lg text-[var(--text-ink)]">
              Modo Leitura Serenidade
            </span>
            <span className="text-xs text-[var(--text-mut)]">· foco profundo sem distrações</span>
          </div>
          <button
            onClick={() => setIsZenMode(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-[var(--border-ln)] hover:bg-[var(--border-ln)]/30 text-[var(--text-ink)]"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Sair do modo zen</span>
          </button>
        </div>
      )}

      {/* Main Timer Box */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-ln)] rounded-2xl p-6 sm:p-8 text-center shadow-xs">
        {/* Mode Selector Tabs */}
        <div className="inline-flex p-1 rounded-xl bg-[var(--border-ln)]/30 border border-[var(--border-ln)] mb-6 gap-1">
          <button
            onClick={() => handleSwitchMode('focus')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              mode === 'focus'
                ? 'bg-[var(--text-ink)] text-[var(--bg-page)] shadow-xs'
                : 'text-[var(--text-mut)] hover:text-[var(--text-ink)]'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Foco de Leitura (25m)</span>
          </button>
          <button
            onClick={() => handleSwitchMode('shortBreak')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              mode === 'shortBreak'
                ? 'bg-[var(--text-ink)] text-[var(--bg-page)] shadow-xs'
                : 'text-[var(--text-mut)] hover:text-[var(--text-ink)]'
            }`}
          >
            <Coffee className="w-4 h-4 text-emerald-500" />
            <span>Pausa Curta (5m)</span>
          </button>
          <button
            onClick={() => handleSwitchMode('longBreak')}
            className={`hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              mode === 'longBreak'
                ? 'bg-[var(--text-ink)] text-[var(--bg-page)] shadow-xs'
                : 'text-[var(--text-mut)] hover:text-[var(--text-ink)]'
            }`}
          >
            <Coffee className="w-4 h-4 text-blue-500" />
            <span>Pausa Longa (15m)</span>
          </button>
        </div>

        {/* Big Tabular Clock */}
        <div className="font-serif-title font-bold text-6xl sm:text-8xl tracking-tight text-[var(--text-ink)] tabular-nums my-2 select-none">
          {formatTime(timeLeft)}
        </div>

        <p className="text-xs sm:text-sm text-[var(--text-mut)] mb-6">
          {mode === 'focus'
            ? 'Momento de mergulhar na leitura e na reflexão com atenção plena.'
            : 'Pausa para respirar, caminhar e decantar as ideias do livro.'}
        </p>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleToggleRun}
            className={`px-8 py-3 rounded-xl font-semibold text-sm sm:text-base flex items-center gap-2 shadow-sm transition-all transform active:scale-95 ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-[var(--brand-ac)] hover:bg-[var(--brand-ac-hover)] text-white'
            }`}
          >
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            <span>{isRunning ? 'Pausar' : 'Iniciar Foco'}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-3 rounded-xl border border-[var(--border-ln)] text-[var(--text-mut)] hover:text-[var(--text-ink)] hover:bg-[var(--border-ln)]/30 transition-colors"
            title="Reiniciar contador"
            aria-label="Reiniciar contador"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-3 rounded-xl border border-[var(--border-ln)] transition-colors ${
              soundEnabled
                ? 'text-[var(--text-ink)] bg-[var(--border-ln)]/30'
                : 'text-[var(--text-mut)] opacity-60'
            }`}
            title={soundEnabled ? 'Sons ativados' : 'Sons desativados'}
            aria-label="Alternar som do alarme"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {!isZenMode && (
            <button
              onClick={() => setIsZenMode(true)}
              className="p-3 rounded-xl border border-[var(--border-ln)] text-[var(--text-mut)] hover:text-[var(--text-ink)] hover:bg-[var(--border-ln)]/30 transition-colors hidden sm:block"
              title="Modo tela cheia / leitura zen"
              aria-label="Modo zen de tela cheia"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Book Linking Option */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-ln)] rounded-xl p-4 sm:p-5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-mut)] mb-2">
          Associar esta sessão a um livro da sua biblioteca
        </label>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <select
            value={activeBookId || ''}
            onChange={(e) => onSelectActiveBook(e.target.value || null)}
            className="flex-1 text-xs sm:text-sm px-3 py-2 rounded-lg border border-[var(--border-ln)] bg-[var(--bg-page)] text-[var(--text-ink)] focus:outline-none focus:border-[var(--brand-ac)]"
          >
            <option value="">Nenhum livro selecionado (foco genérico)</option>
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title} — {b.author} ({b.type === 'audio' ? 'Audiobook' : 'PDF'})
              </option>
            ))}
          </select>

          {activeBook && (
            <a
              href={activeBook.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium border border-[var(--brand-ac)] text-[var(--brand-ac)] hover:bg-[var(--brand-ac)] hover:text-white transition-colors shrink-0"
            >
              {activeBook.type === 'audio' ? <Headphones className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
              <span>Abrir {activeBook.type === 'audio' ? 'áudio' : 'leitura'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Selected Book Preview Card with Cover & Synopsis */}
        {activeBook && (() => {
          const coverSrc = (activeBook.coverKey && COVERS[activeBook.coverKey]) || activeBook.customCover;
          return (
            <div className="mt-4 pt-4 border-t border-[var(--border-ln)]/60 flex items-start gap-4">
              <div className="shrink-0 w-16 sm:w-20 aspect-[3/4.4] rounded-md overflow-hidden border border-[var(--border-ln)] shadow-sm bg-[var(--border-ln)]/20">
                {coverSrc ? (
                  <img src={coverSrc} alt={activeBook.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-1 text-[10px] text-center">
                    {activeBook.title}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] uppercase tracking-wider text-[var(--brand-gold)] font-semibold">
                  Obra em Foco Agora
                </span>
                <h4 className="font-serif-title font-bold text-sm sm:text-base text-[var(--text-ink)] leading-snug">
                  {activeBook.title}
                </h4>
                <p className="text-xs text-[var(--text-mut)]">{activeBook.author}</p>
                <p className="text-xs text-[var(--text-ink)]/85 mt-1.5 line-clamp-2 leading-relaxed">
                  {activeBook.summary}
                </p>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Daily Goal Card */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-ln)] rounded-xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-serif-title font-semibold text-base sm:text-lg text-[var(--text-ink)]">
              Meta Diária de Leitura: 25 minutos
            </span>
            {isGoalReached && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Meta alcançada hoje!</span>
              </span>
            )}
          </div>
          <span className="text-xs sm:text-sm font-semibold tabular-nums text-[var(--text-ink)]">
            {todayFocusMinutes} / {dailyGoalMinutes} min ({goalPercentage}%)
          </span>
        </div>

        <div className="w-full h-3 rounded-full bg-[var(--border-ln)]/60 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isGoalReached ? 'bg-emerald-600' : 'bg-[var(--brand-gold)]'
            }`}
            style={{ width: `${goalPercentage}%` }}
          />
        </div>

        <p className="text-xs text-[var(--text-mut)] mt-2">
          {isGoalReached
            ? 'Parabéns! Você completou sua meta diária de reflexão e leitura filosófica.'
            : `Faltam apenas ${Math.max(0, dailyGoalMinutes - todayFocusMinutes)} minutos para atingir a sua meta de hoje. Uma sessão de Pomodoro completa bate o objetivo.`}
        </p>
      </div>

      {/* Quotes & Wisdom Note */}
      <blockquote className="border-l-2 border-[var(--brand-gold)] pl-4 py-1 italic text-xs sm:text-sm text-[var(--text-mut)] font-serif">
        "Não é o que acontece com você, mas como você reage a isso que importa. Mantenha a mente firme e a atenção no presente."
        <footer className="text-[11px] not-italic text-[var(--text-ink)] font-semibold mt-1">
          — Epicteto, Manual de Epicteto
        </footer>
      </blockquote>
    </div>
  );
};
