import React from 'react';
import { DollarSign, TrendingUp, Award, Calendar, BarChart3 } from 'lucide-react';
import { MonthRecord } from '../types';
import { formatBRL } from '../utils/excel';

interface MetricCardsProps {
  months: MonthRecord[];
}

export const MetricCards: React.FC<MetricCardsProps> = ({ months }) => {
  if (months.length === 0) return null;

  const total = months.reduce((acc, m) => acc + m.total, 0);
  const avgMonthly = total / months.length;

  // Best month
  const sortedByTotal = [...months].sort((a, b) => b.total - a.total);
  const bestMonth = sortedByTotal[0];

  // Latest month vs previous month
  const latestMonth = months[months.length - 1];
  const prevMonth = months.length > 1 ? months[months.length - 2] : null;
  const growth = prevMonth && prevMonth.total > 0
    ? ((latestMonth.total - prevMonth.total) / prevMonth.total) * 100
    : null;

  // Total daily entries
  const totalDays = months.reduce((acc, m) => acc + (m.dailyEntries?.length || 0), 0);
  const avgDaily = totalDays > 0 ? total / totalDays : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Entradas */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total de Entradas
          </span>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {formatBRL(total)}
          </div>
          <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Em {months.length} meses apurados ({totalDays} lançamentos diários)
          </p>
        </div>
      </div>

      {/* Média Mensal */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Média Mensal
          </span>
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {formatBRL(avgMonthly)}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Média de <span className="font-medium text-slate-700">{formatBRL(avgDaily)}</span> por dia trabalhado
          </p>
        </div>
      </div>

      {/* Melhor Mês */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Mês Recorde
          </span>
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {formatBRL(bestMonth.total)}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            <span className="font-semibold text-slate-800">{bestMonth.monthLabel}</span> &bull; {bestMonth.dailyEntries.length} dias de vendas
          </p>
        </div>
      </div>

      {/* Último Mês Registrado */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Último Mês ({latestMonth.monthLabel})
          </span>
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {formatBRL(latestMonth.total)}
          </div>
          <div className="mt-1 flex items-center text-xs">
            {growth !== null ? (
              <span className={`font-semibold mr-1.5 ${growth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {growth >= 0 ? `+${growth.toFixed(1)}%` : `${growth.toFixed(1)}%`}
              </span>
            ) : null}
            <span className="text-slate-500">comparado ao mês anterior</span>
          </div>
        </div>
      </div>
    </div>
  );
};
