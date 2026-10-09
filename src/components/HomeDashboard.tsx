import React from 'react';
import { Book, BookProgress, ReadingLogEntry } from '../types';
import { COVERS } from '../data/covers';
import {
  getPeriods,
  sumUnits,
  sumFocusSeconds,
  getLast7DaysMetrics,
  get12MonthsMetrics,
} from '../utils/stats';
import {
  BookOpen,
  Headphones,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Calendar,
  Layers,
} from 'lucide-react';

interface HomeDashboardProps {
  books: Book[];
  progressMap: Record<string, BookProgress>;
  customTotals: Record<string, number>;
  readingLogs: ReadingLogEntry[];
  pomodoroLogs: Record<string, number>;
  dailyGoalMinutes: number;
  onGoToBook: (bookId: string) => void;
  onStartPomodoro: (bookId?: string) => void;
  onGoToLibrary: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  books,
  progressMap,
  customTotals,
  readingLogs,
  pomodoroLogs,
  dailyGoalMinutes,
  onGoToBook,
  onStartPomodoro,
  onGoToLibrary,
}) => {
  const periods = getPeriods();
  const currentYear = new Date().getFullYear();
  const today = new Date().toISOString().split('T')[0];

  // Completed books
  const completedBooks = books.filter((b) => progressMap[b.id]?.isCompleted);
  // Currently reading books
  const inProgressBooks = books.filter(
    (b) => (progressMap[b.id]?.currentUnit || 0) > 0 && !progressMap[b.id]?.isCompleted
  );
  // Queue / next books
  const nextBooks = books
    .filter((b) => (progressMap[b.id]?.currentUnit || 0) === 0 && !progressMap[b.id]?.isCompleted)
    .slice(0, 4);

  // Period stats
  const weekStats = {
    pdf: sumUnits(readingLogs, periods.semana.start, periods.semana.end, 'pdf'),
    audio: sumUnits(readingLogs, periods.semana.start, periods.semana.end, 'audio'),
    focusMins: Math.round(sumFocusSeconds(pomodoroLogs, periods.semana.start, periods.semana.end) / 60),
    completed: completedBooks.filter(
      (b) =>
        progressMap[b.id]?.completedDate &&
        progressMap[b.id]!.completedDate! >= periods.semana.start &&
        progressMap[b.id]!.completedDate! <= periods.semana.end
    ).length,
  };

  const monthStats = {
    pdf: sumUnits(readingLogs, periods.mes.start, periods.mes.end, 'pdf'),
    audio: sumUnits(readingLogs, periods.mes.start, periods.mes.end, 'audio'),
    focusMins: Math.round(sumFocusSeconds(pomodoroLogs, periods.mes.start, periods.mes.end) / 60),
    completed: completedBooks.filter(
      (b) =>
        progressMap[b.id]?.completedDate &&
        progressMap[b.id]!.completedDate! >= periods.mes.start &&
        progressMap[b.id]!.completedDate! <= periods.mes.end
    ).length,
  };

  const yearStats = {
    pdf: sumUnits(readingLogs, periods.ano.start, periods.ano.end, 'pdf'),
    audio: sumUnits(readingLogs, periods.ano.start, periods.ano.end, 'audio'),
    focusMins: Math.round(sumFocusSeconds(pomodoroLogs, periods.ano.start, periods.ano.end) / 60),
    completed: completedBooks.length,
  };

  // Today Pomodoro
  const todayFocusMins = Math.round((pomodoroLogs[today] || 0) / 60);
  const todayGoalPct = Math.min(100, Math.round((todayFocusMins / dailyGoalMinutes) * 100));

  // 7 days metrics
  const last7Days = getLast7DaysMetrics(readingLogs, pomodoroLogs);
  const maxDayUnits = Math.max(1, ...last7Days.map((d) => d.total));

  // 12 months metrics
  const monthsData = get12MonthsMetrics(readingLogs, currentYear);
  const maxMonthUnits = Math.max(1, ...monthsData.map((m) => m.total));

  // Year books goal
  const yearGoalPct = Math.round((completedBooks.length / Math.max(1, books.length)) * 100);

  return (
    <div className="space-y-8">
      {/* Editorial Welcome Header */}
      <div className="border-b border-[var(--border-ln)] pb-5">
        <span className="text-xs uppercase tracking-widest text-[var(--brand-gold)] font-semibold block mb-1">
          Painel de Leitura & Reflexão
        </span>
        <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-[var(--text-ink)]">
          Seu Andamento na Sabedoria
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-mut)] font-serif italic mt-1 max-w-2xl">
          "Um livro por vez, uma página por dia. A constância constrói o espírito mais que o arrebatamento."
        </p>
      </div>

      {/* 3 Period Cards: Semana, Mês, Ano */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif-title text-base sm:text-lg font-semibold text-[var(--text-ink)] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[var(--brand-ac)]" />
            <span>Ritmo de Leitura (Semana, Mês e Ano)</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Semana */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-ln)] rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow">
            <div>
              <div className="flex items-center justify-between text-xs text-[var(--text-mut)] mb-2">
                <span className="font-semibold uppercase tracking-wider">Esta Semana</span>
                <span className="text-[11px]">Seg a Hoje</span>
              </div>
              <div className="space-y-1 my-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-serif-title text-2xl sm:text-3xl font-bold text-[var(--text-ink)] tabular-nums">
                    {weekStats.pdf}
                  </span>
                  <span className="text-xs text-[var(--text-mut)]">págs. lidas</span>
                </div>
                <div className="flex items-baseline gap-1.5 text-xs text-[var(--text-mut)]">
                  <span className="font-serif-title text-lg font-semibold text-[var(--text-ink)] tabular-nums">
                    {weekStats.audio}
                  </span>
                  <span>min ouvidos</span>
                </div>
              </div>
            </div>
            <div className="pt-2.5 mt-2 border-t border-[var(--border-ln)]/60 text-xs text-[var(--text-mut)] flex items-center justify-between">
              <span>{weekStats.focusMins} min de foco</span>
              <span>{weekStats.completed} concluído(s)</span>
            </div>
          </div>

          {/* Mês */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-ln)] rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow">
            <div>
              <div className="flex items-center justify-between text-xs text-[var(--text-mut)] mb-2">
                <span className="font-semibold uppercase tracking-wider">Este Mês</span>
                <span className="text-[11px]">{periods.mes.label}</span>
              </div>
              <div className="space-y-1 my-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-serif-title text-2xl sm:text-3xl font-bold text-[var(--brand-ac)] tabular-nums">
                    {monthStats.pdf}
                  </span>
                  <span className="text-xs text-[var(--text-mut)]">págs. lidas</span>
                </div>
                <div className="flex items-baseline gap-1.5 text-xs text-[var(--text-mut)]">
                  <span className="font-serif-title text-lg font-semibold text-[var(--text-ink)] tabular-nums">
                    {monthStats.audio}
                  </span>
                  <span>min ouvidos</span>
                </div>
              </div>
            </div>
            <div className="pt-2.5 mt-2 border-t border-[var(--border-ln)]/60 text-xs text-[var(--text-mut)] flex items-center justify-between">
              <span>{monthStats.focusMins} min de foco</span>
              <span>{monthStats.completed} concluído(s)</span>
            </div>
          </div>

          {/* Ano */}
          <div className="bg-[var(--bg-card)] border border-[var(--brand-ac)]/40 rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between text-xs text-[var(--text-mut)] mb-2">
                <span className="font-semibold uppercase tracking-wider text-[var(--brand-gold)]">Meta do Ano ({currentYear})</span>
                <span className="text-[11px] font-semibold text-[var(--text-ink)]">{yearGoalPct}%</span>
              </div>
              <div className="space-y-1 my-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-serif-title text-2xl sm:text-3xl font-bold text-[var(--text-ink)] tabular-nums">
                    {completedBooks.length} de {books.length}
                  </span>
                  <span className="text-xs text-[var(--text-mut)]">livros concluídos</span>
                </div>
                <div className="flex items-baseline gap-2 text-xs text-[var(--text-mut)]">
                  <span>{yearStats.pdf} págs</span>
                  <span>·</span>
                  <span>{yearStats.audio} min áudio</span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--border-ln)]/60 overflow-hidden my-2">
                <div
                  className="h-full bg-emerald-600 transition-all duration-300"
                  style={{ width: `${yearGoalPct}%` }}
                />
              </div>
            </div>
            <div className="pt-2.5 border-t border-[var(--border-ln)]/60 text-xs text-[var(--text-mut)] flex items-center justify-between">
              <span>{yearStats.focusMins} min foco total</span>
              <button
                onClick={onGoToLibrary}
                className="text-[var(--brand-ac)] hover:underline font-medium inline-flex items-center gap-0.5"
              >
                <span>Ver lista</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Goal Banner */}
      <div className="bg-gradient-to-r from-[var(--bg-card)] to-[var(--bg-card-hover)] border border-[var(--border-ln)] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif-title font-semibold text-sm sm:text-base text-[var(--text-ink)]">
              Meta Diária de Foco: 25 minutos
            </h4>
            <p className="text-xs text-[var(--text-mut)] mt-0.5">
              {todayFocusMins >= dailyGoalMinutes
                ? 'Meta de hoje batida com sucesso! Mantenha a mente afiada.'
                : `Você completou ${todayFocusMins} de 25 minutos hoje. Faltam ${Math.max(0, dailyGoalMinutes - todayFocusMins)} min.`}
            </p>
            <div className="w-48 sm:w-64 h-2 rounded-full bg-[var(--border-ln)]/60 overflow-hidden mt-2">
              <div
                className={`h-full transition-all duration-300 ${
                  todayFocusMins >= dailyGoalMinutes ? 'bg-emerald-600' : 'bg-amber-500'
                }`}
                style={{ width: `${todayGoalPct}%` }}
              />
            </div>
          </div>
        </div>

        <button
          onClick={() => onStartPomodoro()}
          className="px-4 py-2 rounded-lg bg-[var(--brand-ac)] text-white text-xs sm:text-sm font-medium hover:bg-[var(--brand-ac-hover)] transition-colors shrink-0 flex items-center justify-center gap-1.5"
        >
          <Clock className="w-4 h-4" />
          <span>Abrir Pomodoro (25 min)</span>
        </button>
      </div>

      {/* Visual Charts: 7 Days & 12 Months */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 7 Days Bar Chart */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-ln)] rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif-title font-semibold text-sm sm:text-base text-[var(--text-ink)] flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[var(--brand-ac)]" />
              <span>Últimos 7 Dias (Páginas + Áudio)</span>
            </h3>
            <span className="text-[11px] text-[var(--text-mut)]">Total diário</span>
          </div>

          <div className="flex items-end justify-between gap-2 h-36 pt-4 border-b border-[var(--border-ln)]/60 px-1">
            {last7Days.map((day) => {
              const barHeightPct = maxDayUnits > 0 ? Math.max(4, Math.round((day.total / maxDayUnits) * 85)) : 4;
              const isToday = day.date === today;

              return (
                <div key={day.date} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-8 bg-[var(--text-ink)] text-[var(--bg-page)] text-[10px] rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {day.total} ({day.pdfPages}p / {day.audioMinutes}m)
                  </div>

                  <span className="text-[10px] text-[var(--text-mut)] mb-1 tabular-nums font-medium">
                    {day.total > 0 ? day.total : ''}
                  </span>

                  <div
                    className={`w-full max-w-[28px] rounded-t-sm transition-all duration-300 ${
                      isToday
                        ? 'bg-[var(--brand-gold)]'
                        : day.total > 0
                        ? 'bg-[var(--brand-ac)]'
                        : 'bg-[var(--border-ln)]/40'
                    }`}
                    style={{ height: `${barHeightPct}%` }}
                  />

                  <span
                    className={`text-[11px] mt-2 ${
                      isToday ? 'font-bold text-[var(--brand-gold)]' : 'text-[var(--text-mut)]'
                    }`}
                  >
                    {day.dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 12 Months Chart */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-ln)] rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif-title font-semibold text-sm sm:text-base text-[var(--text-ink)] flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[var(--brand-ac)]" />
              <span>Meses do Ano ({currentYear})</span>
            </h3>
            <span className="text-[11px] text-[var(--text-mut)]">Evolução mensal</span>
          </div>

          <div className="flex items-end justify-between gap-1.5 h-36 pt-4 border-b border-[var(--border-ln)]/60 px-1">
            {monthsData.map((m) => {
              const barHeightPct = maxMonthUnits > 0 ? Math.max(4, Math.round((m.total / maxMonthUnits) * 85)) : 4;
              const isCurrentMonth = m.monthIndex === new Date().getMonth();

              return (
                <div key={m.monthLabel} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                  <div className="absolute -top-8 bg-[var(--text-ink)] text-[var(--bg-page)] text-[10px] rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {m.total} unid.
                  </div>

                  <span className="text-[9px] text-[var(--text-mut)] mb-1 tabular-nums font-medium">
                    {m.total > 0 ? m.total : ''}
                  </span>

                  <div
                    className={`w-full max-w-[20px] rounded-t-sm transition-all duration-300 ${
                      isCurrentMonth
                        ? 'bg-[var(--brand-ac)]'
                        : m.total > 0
                        ? 'bg-[var(--brand-ac)]/70'
                        : 'bg-[var(--border-ln)]/40'
                    }`}
                    style={{ height: `${barHeightPct}%` }}
                  />

                  <span
                    className={`text-[10px] mt-2 ${
                      isCurrentMonth ? 'font-bold text-[var(--brand-ac)]' : 'text-[var(--text-mut)]'
                    }`}
                  >
                    {m.monthLabel.slice(0, 1)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section: Em Andamento */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif-title text-base sm:text-lg font-semibold text-[var(--text-ink)] flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[var(--brand-ac)]" />
            <span>Livros em Andamento</span>
          </h3>
          <span className="text-xs text-[var(--text-mut)]">{inProgressBooks.length} livro(s)</span>
        </div>

        {inProgressBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {inProgressBooks.map((b) => {
              const prog = progressMap[b.id] || { currentUnit: 0 };
              const total = customTotals[b.id] || b.totalUnits;
              const pct = Math.min(100, Math.round((prog.currentUnit / total) * 100));
              const coverSrc = (b.coverKey && COVERS[b.coverKey]) || b.customCover;

              return (
                <div
                  key={b.id}
                  onClick={() => onGoToBook(b.id)}
                  className="bg-[var(--bg-card)] border border-[var(--border-ln)] rounded-xl p-3.5 flex gap-3 cursor-pointer hover:border-[var(--brand-ac)] transition-all group shadow-2xs hover:shadow-xs"
                >
                  <div className="w-14 sm:w-16 aspect-[3/4.4] rounded overflow-hidden bg-[var(--border-ln)]/30 shrink-0 border border-[var(--border-ln)]">
                    {coverSrc ? (
                      <img src={coverSrc} alt={b.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-1 text-[9px] text-center">
                        {b.title}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <h4 className="font-serif-title font-semibold text-xs sm:text-sm text-[var(--text-ink)] truncate group-hover:text-[var(--brand-ac)] transition-colors">
                        {b.title}
                      </h4>
                      <p className="text-[11px] text-[var(--text-mut)] truncate">{b.author}</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11px] text-[var(--text-mut)] mb-1">
                        <span className="tabular-nums">
                          {prog.currentUnit} de {total} {b.type === 'audio' ? 'min' : 'pág.'}
                        </span>
                        <span className="font-semibold text-[var(--text-ink)] tabular-nums">{pct}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[var(--border-ln)]/60 overflow-hidden">
                        <div
                          className="h-full bg-[var(--brand-ac)] transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[var(--bg-card)] border border-[var(--border-ln)] rounded-xl p-6 text-center text-xs sm:text-sm text-[var(--text-mut)]">
            <p>Nenhum livro iniciado no momento.</p>
            <p className="mt-1">Escolha um dos próximos livros abaixo para começar a sua leitura.</p>
          </div>
        )}
      </div>

      {/* Section: Próximos a Ler */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--brand-gold)]" />
            <h3 className="font-serif-title text-base sm:text-lg font-semibold text-[var(--text-ink)]">
              Próximos a Serem Lidos
            </h3>
          </div>
          <button
            onClick={onGoToLibrary}
            className="text-xs text-[var(--brand-ac)] hover:underline font-medium inline-flex items-center gap-1"
          >
            <span>Ver toda a biblioteca</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {nextBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {nextBooks.map((b) => {
              const coverSrc = (b.coverKey && COVERS[b.coverKey]) || b.customCover;

              return (
                <div
                  key={b.id}
                  className="bg-[var(--bg-card)] border border-[var(--border-ln)] rounded-xl p-4 flex flex-col justify-between hover:border-[var(--brand-gold)] transition-colors shadow-2xs group"
                >
                  <div>
                    <div className="aspect-[3/4.2] rounded overflow-hidden bg-[var(--border-ln)]/30 border border-[var(--border-ln)] mb-3">
                      {coverSrc ? (
                        <img
                          src={coverSrc}
                          alt={b.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-2 text-center text-xs font-serif-title">
                          {b.title}
                        </div>
                      )}
                    </div>

                    <div className="text-[11px] text-[var(--text-mut)] flex items-center gap-1 mb-1">
                      {b.type === 'audio' ? <Headphones className="w-3 h-3 text-amber-600" /> : <BookOpen className="w-3 h-3 text-blue-600" />}
                      <span>{b.type === 'audio' ? `${b.totalUnits} min` : `${b.totalUnits} pág.`}</span>
                    </div>

                    <h4 className="font-serif-title font-semibold text-xs sm:text-sm text-[var(--text-ink)] line-clamp-1">
                      {b.title}
                    </h4>
                    <p className="text-[11px] text-[var(--text-mut)] truncate mb-2">{b.author}</p>
                    <p className="text-xs text-[var(--text-mut)] line-clamp-2 leading-relaxed">
                      {b.summary}
                    </p>
                  </div>

                  <button
                    onClick={() => onGoToBook(b.id)}
                    className="mt-4 w-full py-1.5 rounded-lg text-xs font-medium border border-[var(--brand-ac)] text-[var(--brand-ac)] hover:bg-[var(--brand-ac)] hover:text-white transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Começar leitura</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[var(--bg-card)] border border-[var(--border-ln)] rounded-xl p-6 text-center text-xs text-[var(--text-mut)]">
            Todos os livros foram iniciados ou concluídos! Você pode adicionar novos títulos na aba Biblioteca.
          </div>
        )}
      </div>

      {/* Completed Books Shelf */}
      {completedBooks.length > 0 && (
        <div className="bg-[var(--color-ok-bg)]/40 border border-emerald-300 dark:border-emerald-800/50 rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-serif-title text-sm sm:text-base font-semibold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Obras Concluídas Neste Ano ({completedBooks.length})</span>
            </h3>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {completedBooks.map((b) => (
              <button
                key={b.id}
                onClick={() => onGoToBook(b.id)}
                className="px-2.5 py-1 rounded-md bg-[var(--bg-card)] border border-emerald-300 dark:border-emerald-800/60 text-[var(--text-ink)] hover:border-emerald-500 transition-colors flex items-center gap-1.5"
              >
                <span>{b.title}</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">✓</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
