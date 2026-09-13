import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell
} from 'recharts';
import { MonthRecord } from '../types';
import { formatBRL, formatNumber } from '../utils/excel';
import { MONTH_SHORT } from '../data/initialData';
import { BarChart3, TrendingUp, Calendar, CalendarRange } from 'lucide-react';

interface MonthlyChartsProps {
  months: MonthRecord[];
  onSelectMonth?: (month: MonthRecord) => void;
}

type ChartTab = 'timeline' | 'yoy' | 'annual' | 'weekday';

export const MonthlyCharts: React.FC<MonthlyChartsProps> = ({
  months,
  onSelectMonth
}) => {
  const [activeTab, setActiveTab] = useState<ChartTab>('timeline');
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>('all');

  // Available years
  const availableYears = useMemo(() => {
    const set = new Set<number>(months.map((m) => m.year));
    return Array.from(set).sort((a: number, b: number) => b - a);
  }, [months]);

  // Filtered months for timeline
  const filteredMonths = useMemo(() => {
    if (selectedYearFilter === 'all') return months;
    const y = parseInt(selectedYearFilter, 10);
    return months.filter((m) => m.year === y);
  }, [months, selectedYearFilter]);

  // Calculate average for the reference line
  const averageValue = useMemo(() => {
    if (filteredMonths.length === 0) return 0;
    const sum = filteredMonths.reduce((acc, m) => acc + m.total, 0);
    return sum / filteredMonths.length;
  }, [filteredMonths]);

  // 1. Timeline Data
  const timelineData = useMemo(() => {
    return filteredMonths.map((m) => ({
      label: m.monthLabel,
      total: m.total,
      raw: m,
      daysCount: m.dailyEntries?.length || 0,
      notes: (m.notes || []).join(' ')
    }));
  }, [filteredMonths]);

  // 2. YoY Comparison Data (Jan-Dez for each year)
  const yoyData = useMemo(() => {
    const dataByMonth = MONTH_SHORT.map((shortName, monthIdx) => {
      const row: Record<string, any> = { monthName: shortName };
      availableYears.forEach((yr) => {
        const found = months.find((m) => m.year === yr && m.monthIndex === monthIdx);
        row[`ano_${yr}`] = found ? found.total : 0;
      });
      return row;
    });
    return dataByMonth;
  }, [months, availableYears]);

  // 3. Annual Totals Data
  const annualData = useMemo(() => {
    const yearsSorted = [...availableYears].sort((a, b) => a - b);
    return yearsSorted.map((yr) => {
      const yMonths = months.filter((m) => m.year === yr);
      const total = yMonths.reduce((acc, m) => acc + m.total, 0);
      const avg = yMonths.length > 0 ? total / yMonths.length : 0;
      return {
        year: String(yr),
        total,
        monthsCount: yMonths.length,
        average: avg
      };
    });
  }, [months, availableYears]);

  // 4. Weekday Analysis Data
  const weekdayData = useMemo(() => {
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const sums = [0, 0, 0, 0, 0, 0, 0];
    const counts = [0, 0, 0, 0, 0, 0, 0];

    filteredMonths.forEach((m) => {
      m.dailyEntries.forEach((d) => {
        const dateObj = new Date(m.year, m.monthIndex, d.day);
        if (!isNaN(dateObj.getTime())) {
          const wDay = dateObj.getDay();
          sums[wDay] += d.value;
          counts[wDay] += 1;
        }
      });
    });

    return dayNames.map((name, i) => ({
      day: name,
      total: sums[i],
      count: counts[i],
      average: counts[i] > 0 ? sums[i] / counts[i] : 0
    }));
  }, [filteredMonths]);

  // Colors for YoY
  const yearColors: Record<number, string> = {
    2021: '#94a3b8', // slate
    2022: '#38bdf8', // sky
    2023: '#3b82f6', // blue
    2024: '#8b5cf6', // purple
    2025: '#10b981'  // emerald
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 mb-6">
      {/* Chart Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            Referência Visual de Entradas Mês a Mês
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Visualize o fluxo financeiro da loja, identifique recordes, sazonalidades e evolução histórica
          </p>
        </div>

        {/* Tabs & Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'timeline'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              Evolução Mensal
            </button>
            <button
              onClick={() => setActiveTab('yoy')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'yoy'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              Comparativo Ano a Ano
            </button>
            <button
              onClick={() => setActiveTab('annual')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'annual'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              Total por Ano
            </button>
            <button
              onClick={() => setActiveTab('weekday')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'weekday'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              Dias da Semana
            </button>
          </div>

          {activeTab === 'timeline' && (
            <select
              value={selectedYearFilter}
              onChange={(e) => setSelectedYearFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 font-medium hover:border-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Todos os Anos (Histórico Completo)</option>
              {availableYears.map((yr) => (
                <option key={yr} value={String(yr)}>
                  Somente {yr}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-96 w-full pt-4">
        {/* 1. TIMELINE CHART */}
        {activeTab === 'timeline' && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={timelineData}
              margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: '#64748b', fontSize: 11 }}
                interval={timelineData.length > 25 ? 1 : 0}
                angle={timelineData.length > 15 ? -45 : 0}
                textAnchor={timelineData.length > 15 ? 'end' : 'middle'}
                height={timelineData.length > 15 ? 55 : 30}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
                width={65}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs border border-slate-800 space-y-1">
                        <div className="font-semibold text-slate-200 border-b border-slate-700 pb-1">
                          {data.label} &bull; {data.daysCount} dias com vendas
                        </div>
                        <div className="text-emerald-400 text-sm font-bold pt-0.5">
                          {formatBRL(data.total)}
                        </div>
                        {data.notes && (
                          <div className="text-amber-300 text-[11px] pt-1">
                            ℹ {data.notes}
                          </div>
                        )}
                        <div className="text-slate-400 text-[10px] italic pt-1">
                          Clique na barra para ver os lançamentos diários
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                y={averageValue}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{
                  value: `Média: ${formatBRL(averageValue)}`,
                  fill: '#b45309',
                  fontSize: 11,
                  position: 'top'
                }}
              />
              <Bar
                dataKey="total"
                radius={[4, 4, 0, 0]}
                onClick={(entry) => {
                  if (onSelectMonth && entry?.raw) {
                    onSelectMonth(entry.raw);
                  }
                }}
                className="cursor-pointer"
              >
                {timelineData.map((entry, index) => {
                  // Highlight highest month
                  const isTop = entry.total >= 40000;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={isTop ? '#059669' : '#10b981'}
                      className="hover:opacity-80 transition-opacity"
                    />
                  );
                })}
              </Bar>
              <Line
                type="monotone"
                dataKey="total"
                stroke="#047857"
                strokeWidth={2}
                dot={{ r: 3, fill: '#047857' }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {/* 2. YEAR-OVER-YEAR (YOY) COMPARISON */}
        {activeTab === 'yoy' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={yoyData}
              margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="monthName" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
                width={65}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs border border-slate-800 space-y-1.5">
                        <div className="font-semibold text-slate-200 border-b border-slate-700 pb-1">
                          Mês de {label} (Comparativo Anual)
                        </div>
                        {payload.map((item, idx) => {
                          const yr = item.dataKey ? String(item.dataKey).replace('ano_', '') : '';
                          const val = Number(item.value || 0);
                          return (
                            <div key={idx} className="flex items-center justify-between gap-4">
                              <span className="flex items-center gap-1.5 text-slate-300">
                                <span
                                  className="w-2.5 h-2.5 rounded-full"
                                  style={{ backgroundColor: item.color }}
                                />
                                {yr}:
                              </span>
                              <span className="font-mono font-medium text-white">
                                {val > 0 ? formatBRL(val) : 'Sem registro'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                formatter={(val) => String(val).replace('ano_', 'Ano ')}
                wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
              />
              {availableYears.map((yr) => (
                <Bar
                  key={yr}
                  dataKey={`ano_${yr}`}
                  name={`ano_${yr}`}
                  fill={yearColors[yr] || '#6366f1'}
                  radius={[3, 3, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* 3. ANNUAL TOTALS */}
        {activeTab === 'annual' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={annualData}
              margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }} />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
                width={70}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs border border-slate-800 space-y-1">
                        <div className="font-semibold text-slate-200 border-b border-slate-700 pb-1">
                          Ano de {d.year} ({d.monthsCount} meses)
                        </div>
                        <div className="text-emerald-400 font-bold text-sm">
                          Total: {formatBRL(d.total)}
                        </div>
                        <div className="text-slate-300">
                          Média mensal: {formatBRL(d.average)}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="total" fill="#0ea5e9" radius={[6, 6, 0, 0]} name="Total Faturado no Ano">
                {annualData.map((_, index) => (
                  <Cell
                    key={`cell-yr-${index}`}
                    fill={['#94a3b8', '#38bdf8', '#3b82f6', '#8b5cf6', '#10b981'][index % 5]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* 4. WEEKDAY PERFORMANCE */}
        {activeTab === 'weekday' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weekdayData}
              margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
                width={65}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs border border-slate-800 space-y-1">
                        <div className="font-semibold text-slate-200 border-b border-slate-700 pb-1">
                          {d.day}
                        </div>
                        <div className="text-emerald-400 font-bold text-sm">
                          Total acumulado: {formatBRL(d.total)}
                        </div>
                        <div className="text-slate-300">
                          Média por {d.day}: {formatBRL(d.average)}
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          {d.count} dias registrados com venda
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="average" fill="#6366f1" radius={[4, 4, 0, 0]} name="Média por Dia (R$)" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Helper Legend / Tips */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            Entradas Mensais
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            Linha de Média ({formatBRL(averageValue)})
          </span>
        </div>
        <div className="text-slate-400 italic">
          Dica: Você pode clicar em qualquer barra de mês para abrir os detalhes dia a dia.
        </div>
      </div>
    </div>
  );
};
