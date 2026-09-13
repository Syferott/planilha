import React, { useState, useMemo } from 'react';
import { MonthRecord } from '../types';
import { formatBRL } from '../utils/excel';
import { Search, Eye, Filter, ArrowUpDown, ChevronDown, ChevronUp, Sparkles, Building2 } from 'lucide-react';

interface DataTableProps {
  months: MonthRecord[];
  onSelectMonth: (month: MonthRecord) => void;
}

type SortField = 'period' | 'total' | 'days' | 'dailyAvg';
type SortOrder = 'asc' | 'desc';

export const DataTable: React.FC<DataTableProps> = ({
  months,
  onSelectMonth
}) => {
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('period');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const availableYears = useMemo(() => {
    const set = new Set<number>(months.map((m) => m.year));
    return Array.from(set).sort((a: number, b: number) => b - a);
  }, [months]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredAndSortedMonths = useMemo(() => {
    let result = [...months];

    // Filter by year
    if (selectedYear !== 'all') {
      const yr = parseInt(selectedYear, 10);
      result = result.filter((m) => m.year === yr);
    }

    // Filter by search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (m) =>
          m.monthLabel.toLowerCase().includes(term) ||
          m.year.toString().includes(term) ||
          (m.notes && m.notes.some((n) => n.toLowerCase().includes(term)))
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'period') {
        const dateA = a.year * 100 + a.monthIndex;
        const dateB = b.year * 100 + b.monthIndex;
        comparison = dateA - dateB;
      } else if (sortField === 'total') {
        comparison = a.total - b.total;
      } else if (sortField === 'days') {
        comparison = (a.dailyEntries?.length || 0) - (b.dailyEntries?.length || 0);
      } else if (sortField === 'dailyAvg') {
        const avgA = a.dailyEntries.length > 0 ? a.total / a.dailyEntries.length : 0;
        const avgB = b.dailyEntries.length > 0 ? b.total / b.dailyEntries.length : 0;
        comparison = avgA - avgB;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [months, selectedYear, searchTerm, sortField, sortOrder]);

  const totalPeriodRevenue = useMemo(() => {
    return filteredAndSortedMonths.reduce((acc, m) => acc + m.total, 0);
  }, [filteredAndSortedMonths]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Planilha Detalhada de Movimentação Mês a Mês
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {filteredAndSortedMonths.length} meses
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Total filtrado no período:{' '}
            <span className="font-bold text-emerald-700">{formatBRL(totalPeriodRevenue)}</span>
          </p>
        </div>

        {/* Year Pills & Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Year Pills */}
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-medium text-slate-600">
            <button
              onClick={() => setSelectedYear('all')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                selectedYear === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              Todos
            </button>
            {availableYears.map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(String(yr))}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  selectedYear === String(yr)
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'hover:text-slate-900'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar mês ou nota..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <th
                onClick={() => toggleSort('period')}
                className="py-3 px-4 cursor-pointer hover:text-slate-800 transition-colors select-none"
              >
                <div className="flex items-center gap-1">
                  Mês / Período
                  {sortField === 'period' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>

              <th
                onClick={() => toggleSort('total')}
                className="py-3 px-4 cursor-pointer hover:text-slate-800 transition-colors select-none"
              >
                <div className="flex items-center gap-1">
                  Total Entradas (R$)
                  {sortField === 'total' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>

              <th
                onClick={() => toggleSort('days')}
                className="py-3 px-4 cursor-pointer hover:text-slate-800 transition-colors select-none"
              >
                <div className="flex items-center gap-1">
                  Dias com Vendas
                  {sortField === 'days' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>

              <th
                onClick={() => toggleSort('dailyAvg')}
                className="py-3 px-4 cursor-pointer hover:text-slate-800 transition-colors select-none"
              >
                <div className="flex items-center gap-1">
                  Média Diária
                  {sortField === 'dailyAvg' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>

              <th className="py-3 px-4">Maior Entrada do Mês</th>
              <th className="py-3 px-4">Aluguel / Despesas</th>
              <th className="py-3 px-4">Observações</th>
              <th className="py-3 px-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAndSortedMonths.map((m) => {
              const dailyVals = m.dailyEntries.map((d) => d.value);
              const maxVal = dailyVals.length > 0 ? Math.max(...dailyVals) : 0;
              const avgVal = dailyVals.length > 0 ? m.total / dailyVals.length : 0;
              const isHigh = m.total >= 30000;

              return (
                <tr
                  key={m.id}
                  onClick={() => onSelectMonth(m)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  {/* Mês */}
                  <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    {m.monthLabel}
                    {isHigh && (
                      <span className="inline-flex items-center text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-sm font-semibold">
                        <Sparkles className="w-2.5 h-2.5 mr-0.5" /> Destaque
                      </span>
                    )}
                  </td>

                  {/* Total Entradas */}
                  <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                    {formatBRL(m.total)}
                  </td>

                  {/* Dias */}
                  <td className="py-3 px-4 text-slate-600">
                    {m.dailyEntries.length} dias
                  </td>

                  {/* Média Diária */}
                  <td className="py-3 px-4 text-slate-700 font-medium">
                    {formatBRL(avgVal)}
                  </td>

                  {/* Maior Entrada */}
                  <td className="py-3 px-4 text-slate-600">
                    {maxVal > 0 ? formatBRL(maxVal) : '-'}
                  </td>

                  {/* Aluguel */}
                  <td className="py-3 px-4 text-slate-600">
                    {m.aluguel ? (
                      <span className="inline-flex items-center text-slate-700 font-medium gap-1">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        {formatBRL(m.aluguel)}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>

                  {/* Observações */}
                  <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                    {m.notes && m.notes.length > 0 ? (
                      <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                        {m.notes.join('; ')}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>

                  {/* Ação */}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectMonth(m);
                      }}
                      className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg group-hover:border-emerald-500 group-hover:text-emerald-700 transition-colors shadow-2xs"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Ver Dias
                    </button>
                  </td>
                </tr>
              );
            })}

            {filteredAndSortedMonths.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  Nenhum registro encontrado para os filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
