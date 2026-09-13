export interface DailyEntry {
  id: string;
  date: string; // YYYY-MM-DD or DD/MM/YYYY
  day: number;
  value: number;
  notes?: string;
}

export interface MonthRecord {
  id: string; // e.g. "2024-05" or "mai/24"
  year: number;
  monthIndex: number; // 0 = Jan, 11 = Dec
  monthLabel: string; // e.g. "Mai/24" or "Maio 2024"
  total: number;
  daysCount?: number;
  dailyEntries: DailyEntry[];
  notes?: string[];
  aluguel?: number;
}

export interface YearSummary {
  year: number;
  total: number;
  monthsCount: number;
  averageMonth: number;
  bestMonth: { label: string; value: number };
}

export interface DayOfWeekStat {
  dayName: string;
  total: number;
  average: number;
  count: number;
}
