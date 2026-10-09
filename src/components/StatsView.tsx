import React from 'react';
import { Book, BookProgress, ReadingLogEntry } from '../types';
import {
  getPeriods,
  sumUnits,
  sumFocusSeconds,
  formatMinutesToHours,
  formatDateBr,
  getLast7DaysMetrics,
  get12MonthsMetrics,
} from '../utils/stats';
import {
  BarChart3,
  Calendar,
  BookOpen,
  Headphones,
  Star,
  CheckCircle2,
  Clock,
  Award,
} from 'lucide-react';

interface StatsViewProps {
  books: Book[];
  progressMap: Record<string, BookProgress>;
  customTotals: Record<string, number>;
  readingLogs: ReadingLogEntry[];
  pomodoroLogs: Record<string, number>;
}

export const StatsView: React.FC<StatsViewProps> = ({
  books,
  progressMap,
  customTotals,
  readingLogs,
  pomodoroLogs,
}) => {
  const periods = getPeriods();
  const currentYear = new Date().getFullYear();

  // Aggregate stats
  const totalPdfPages = readingLogs
    .filter((l) => l.type === 'pdf')
    .reduce((a, b) => a + b.units, 0);

  const totalAudioMinutes = readingLogs
    .filter((l) => l.type === 'audio')
    .reduce((a, b) => a + b.units, 0);

  let totalFocusSecs = 0;
  for (const d in pomodoroLogs) {
    totalFocusSecs += pomodoroLogs[d] || 0;
  }
  const totalFocusMins = Math.round(totalFocusSecs / 60);

  const completedBooks = books.filter((b) => progressMap[b.id]?.isCompleted);
  const inProgressBooks = books.filter(
    (b) => (progressMap[b.id]?.currentUnit || 0) > 0 && !progressMap[b.id]?.isCompleted
  );

  // Ratings calculation
  const ratedBooks = books.filter((b) => (progressMap[b.id]?.rating || 0) > 0);
  const avgRating =
    ratedBooks.length > 0
      ? (
          ratedBooks.reduce((acc, b) => acc + progressMap[b.id]!.rating, 0) /
          ratedBooks.length
        ).toFixed(1)
      : '—';

  // Reading type distribution
  const typeCounts: Record<string, number> = {};
  books.forEach((b) => {
    const t = progressMap[b.id]?.readingType;
    if (t) {
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    }
  });

  // 7 days and 12 months data
  const last7Days = getLast7DaysMetrics(readingLogs, pomodoroLogs);
  const maxDayUnits = Math.max(1, ...last7Days.map((d) => d.total));

  const monthsData = get12MonthsMetrics(readingLogs, currentYear);
  const maxMonthUnits = Math.max(1, ...monthsData.map((m) => m.total));

  // Recent 10 logs
  const recentLogs = [...readingLogs]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10);

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="border-b border-[var(--border-ln)] pb-4">
        <span className="text-xs uppercase tracking-widest text-[var(--brand-gold)] font-semibold block mb-1">
          Análise e Relatórios de Leitura
        </span>
        <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-[var(--text-ink)] flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-[var(--brand-ac)]" />
          <span>Estatísticas de Desempenho e Constância</span>
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-mut)] font-serif italic mt-0.5">
          Acompanhamento métrico do volume de páginas lidas, horas de audição e foco mental acumulado.
        </p>
      </div>

      {/* Top High-Level Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-[var(--bg-card)] border border-[var(--border-ln)] rounded-xl p-4 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-mut)] mb-1">
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span className="uppercase tracking-wider font-semibold">Páginas Lidas</span>
          </div>
          <div className="font-serif-title text-2xl sm:text-3xl font-bold text-[var(--text-ink)] tabular-nums">
            {totalPdfPages}
          </div>
          <p className="text-[11px] text-[var(--text-mut)] mt-1">Registradas em livros e PDFs</p>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-ln)] rounded-xl p-4 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-mut)] mb-1">
            <Headphones className="w-3.5 h-3.5 text-amber-600" />
            <span className="uppercase tracking-wider font-semibold">Áudio Ouvido</span>
          </div>
          <div className="font-serif-title text-2xl sm:text-3xl font-bold text-[var(--text-ink)] tabular-nums">
            {formatMinutesToHours(totalAudioMinutes)}
          </div>
          <p className="text-[11px] text-[var(--text-mut)] mt-1">{totalAudioMinutes} min totais</p>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-ln)] rounded-xl p-4 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-mut)] mb-1">
            <Clock className="w-3.5 h-3.5 text-[var(--brand-ac)]" />
            <span className="uppercase tracking-wider font-semibold">Foco Pomodoro</span>
          </div>
          <div className="font-serif-title text-2xl sm:text-3xl font-bold text-[var(--text-ink)] tabular-nums">
            {formatMinutesToHours(totalFocusMins)}
          </div>
          <p className="text-[11px] text-[var(--text-mut)] mt-1">Tempo de estudo profundo</p>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-ln)] rounded-xl p-4 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-mut)] mb-1">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span className="uppercase tracking-wider font-semibold">Concluídos</span>
          </div>
          <div className="font-serif-title text-2xl sm:text-3xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
            {completedBooks.length} / {books.length}
          </div>
          <p className="text-[11px] text-[var(--text-mut)] mt-1">
            {Math.round((completedBooks.length / Math.max(1, books.length)) * 100)}% da meta anual
          </p>
        </div>
      </div>

      {/* Comparisons: Semana vs Mês vs Ano */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-ln)] rounded-xl p-5 shadow-xs">
        <h3 className="font-serif-title text-base sm:text-lg font-semibold text-[var(--text-ink)] mb-4">
          Comparativo por Períodos
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[var(--border-ln)] text-[var(--text-mut)] font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 pr-4">Período</th>
                <th className="py-2.5 px-4 text-right">Páginas Lidas</th>
                <th className="py-2.5 px-4 text-right">Minutos de Áudio</th>
                <th className="py-2.5 px-4 text-right">Foco Pomodoro</th>
                <th className="py-2.5 pl-4 text-right">Livros Concluídos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-ln)]/60 text-[var(--text-ink)]">
              <tr>
                <td className="py-3 pr-4 font-medium">Esta Semana ({periods.semana.start} a Hoje)</td>
                <td className="py-3 px-4 text-right tabular-nums">{sumUnits(readingLogs, periods.semana.start, periods.semana.end, 'pdf')}</td>
                <td className="py-3 px-4 text-right tabular-nums">{sumUnits(readingLogs, periods.semana.start, periods.semana.end, 'audio')} min</td>
                <td className="py-3 px-4 text-right tabular-nums">{Math.round(sumFocusSeconds(pomodoroLogs, periods.semana.start, periods.semana.end) / 60)} min</td>
                <td className="py-3 pl-4 text-right tabular-nums font-semibold">
                  {completedBooks.filter((b) => progressMap[b.id]?.completedDate && progressMap[b.id]!.completedDate! >= periods.semana.start).length}
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium">Este Mês ({periods.mes.label})</td>
                <td className="py-3 px-4 text-right tabular-nums font-semibold text-[var(--brand-ac)]">{sumUnits(readingLogs, periods.mes.start, periods.mes.end, 'pdf')}</td>
                <td className="py-3 px-4 text-right tabular-nums font-semibold">{sumUnits(readingLogs, periods.mes.start, periods.mes.end, 'audio')} min</td>
                <td className="py-3 px-4 text-right tabular-nums">{Math.round(sumFocusSeconds(pomodoroLogs, periods.mes.start, periods.mes.end) / 60)} min</td>
                <td className="py-3 pl-4 text-right tabular-nums font-semibold">
                  {completedBooks.filter((b) => progressMap[b.id]?.completedDate && progressMap[b.id]!.completedDate! >= periods.mes.start).length}
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium">Ano Completo ({currentYear})</td>
                <td className="py-3 px-4 text-right tabular-nums">{sumUnits(readingLogs, periods.ano.start, periods.ano.end, 'pdf')}</td>
                <td className="py-3 px-4 text-right tabular-nums">{sumUnits(readingLogs, periods.ano.start, periods.ano.end, 'audio')} min</td>
                <td className="py-3 px-4 text-right tabular-nums">{totalFocusMins} min</td>
                <td className="py-3 pl-4 text-right tabular-nums font-bold text-emerald-700 dark:text-emerald-400">
                  {completedBooks.length}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Ratings & Reading Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rating Breakdown */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-ln)] rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-serif-title text-sm sm:text-base font-semibold text-[var(--text-ink)] flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Avaliação Média dos Livros</span>
            </h3>
            <span className="font-serif-title font-bold text-lg text-amber-500 tabular-nums">
              {avgRating} <span className="text-xs text-[var(--text-mut)] font-normal">/ 5.0</span>
            </span>
          </div>

          <div className="space-y-2 mt-4 text-xs">
            {[5, 4, 3, 2, 1].map((s) => {
              const count = books.filter((b) => progressMap[b.id]?.rating === s).length;
              const pct = ratedBooks.length > 0 ? Math.round((count / ratedBooks.length) * 100) : 0;

              return (
                <div key={s} className="flex items-center gap-2">
                  <span className="w-12 text-[var(--text-mut)] flex items-center gap-0.5">
                    <span>{s}</span>
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-[var(--border-ln)]/60 overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-12 text-right tabular-nums text-[var(--text-mut)]">
                    {count} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reading Types */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-ln)] rounded-xl p-5 shadow-2xs">
          <h3 className="font-serif-title text-sm sm:text-base font-semibold text-[var(--text-ink)] mb-3">
            Distribuição por Tipo de Leitura
          </h3>

          {Object.keys(typeCounts).length > 0 ? (
            <div className="space-y-2.5 text-xs">
              {Object.entries(typeCounts).map(([type, count]) => {
                const pct = Math.round((count / Math.max(1, books.length)) * 100);
                return (
                  <div key={type} className="space-y-1">
                    <div className="flex items-center justify-between text-[var(--text-mut)]">
                      <span>{type}</span>
                      <span className="tabular-nums font-semibold text-[var(--text-ink)]">
                        {count} livro(s) · {pct}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[var(--border-ln)]/60 overflow-hidden">
                      <div className="h-full bg-[var(--brand-ac)]" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-[var(--text-mut)] py-4 text-center">
              Você ainda não categorizou o tipo de leitura dos seus livros. Abra qualquer obra na Biblioteca e selecione o tipo na seção "Avaliação e anotações".
            </p>
          )}
        </div>
      </div>

      {/* Recent Activity Log */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-ln)] rounded-xl p-5 shadow-2xs">
        <h3 className="font-serif-title text-sm sm:text-base font-semibold text-[var(--text-ink)] mb-3">
          Histórico Recente de Páginas e Minutos Registrados
        </h3>

        {recentLogs.length > 0 ? (
          <div className="divide-y divide-[var(--border-ln)]/60 text-xs sm:text-sm">
            {recentLogs.map((log) => {
              const book = books.find((b) => b.id === log.bookId);
              return (
                <div key={log.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-semibold text-[var(--text-ink)]">
                      {book ? book.title : 'Livro'}
                    </span>
                    <span className="text-xs text-[var(--text-mut)] ml-2">
                      ({formatDateBr(log.date)})
                    </span>
                  </div>
                  <div className="font-semibold tabular-nums text-[var(--brand-ac)]">
                    +{log.units} {log.type === 'audio' ? 'minutos ouvidos' : 'páginas lidas'}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-[var(--text-mut)] text-center py-4">
            Nenhum registro de leitura recente. Ao atualizar as páginas dos seus livros, o histórico diário aparecerá aqui.
          </p>
        )}
      </div>
    </div>
  );
};
