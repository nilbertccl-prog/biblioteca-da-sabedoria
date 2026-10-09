import { ReadingLogEntry, BookType } from '../types';

export const getTodayIso = (): string => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

export const formatDateBr = (isoStr?: string): string => {
  if (!isoStr) return '';
  const parts = isoStr.split('-');
  if (parts.length !== 3) return isoStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

export const formatMinutesToHours = (totalMinutes: number): string => {
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
};

export interface PeriodRange {
  start: string;
  end: string;
  label: string;
}

export const getPeriods = (): Record<'semana' | 'mes' | 'ano', PeriodRange> => {
  const now = new Date();
  const today = getTodayIso();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  // Start of week (Monday)
  const dayOfWeek = (now.getDay() + 6) % 7; // 0 = Monday, 6 = Sunday
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  const weekStart = startOfWeek.toISOString().split('T')[0];

  return {
    semana: {
      start: weekStart,
      end: today,
      label: 'Esta Semana',
    },
    mes: {
      start: `${year}-${month}-01`,
      end: `${year}-${month}-31`,
      label: 'Este Mês',
    },
    ano: {
      start: `${year}-01-01`,
      end: `${year}-12-31`,
      label: `Ano ${year}`,
    },
  };
};

export const sumUnits = (
  logs: ReadingLogEntry[],
  from: string,
  to: string,
  type?: BookType
): number => {
  return logs
    .filter((l) => l.date >= from && l.date <= to && (!type || l.type === type))
    .reduce((acc, curr) => acc + curr.units, 0);
};

export const sumFocusSeconds = (
  pomodoroLogs: Record<string, number>,
  from: string,
  to: string
): number => {
  let total = 0;
  for (const date in pomodoroLogs) {
    if (date >= from && date <= to) {
      total += pomodoroLogs[date] || 0;
    }
  }
  return total;
};

export interface DayMetric {
  date: string;
  dayLabel: string;
  pdfPages: number;
  audioMinutes: number;
  total: number;
  focusMinutes: number;
}

export const getLast7DaysMetrics = (
  logs: ReadingLogEntry[],
  pomodoroLogs: Record<string, number>
): DayMetric[] => {
  const result: DayMetric[] = [];
  const now = new Date();
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = dayNames[d.getDay()];

    const pdfPages = logs
      .filter((l) => l.date === dateStr && l.type === 'pdf')
      .reduce((a, b) => a + b.units, 0);

    const audioMinutes = logs
      .filter((l) => l.date === dateStr && l.type === 'audio')
      .reduce((a, b) => a + b.units, 0);

    const focusSeconds = pomodoroLogs[dateStr] || 0;

    result.push({
      date: dateStr,
      dayLabel,
      pdfPages,
      audioMinutes,
      total: pdfPages + audioMinutes,
      focusMinutes: Math.round(focusSeconds / 60),
    });
  }

  return result;
};

export interface MonthMetric {
  monthIndex: number;
  monthLabel: string;
  pdfPages: number;
  audioMinutes: number;
  total: number;
}

export const get12MonthsMetrics = (
  logs: ReadingLogEntry[],
  year: number
): MonthMetric[] => {
  const monthLabels = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
  ];

  return monthLabels.map((label, idx) => {
    const monthPrefix = `${year}-${String(idx + 1).padStart(2, '0')}`;
    const pdfPages = logs
      .filter((l) => l.date.startsWith(monthPrefix) && l.type === 'pdf')
      .reduce((a, b) => a + b.units, 0);

    const audioMinutes = logs
      .filter((l) => l.date.startsWith(monthPrefix) && l.type === 'audio')
      .reduce((a, b) => a + b.units, 0);

    return {
      monthIndex: idx,
      monthLabel: label,
      pdfPages,
      audioMinutes,
      total: pdfPages + audioMinutes,
    };
  });
};
