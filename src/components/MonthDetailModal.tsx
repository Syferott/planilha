import React, { useState } from 'react';
import { X, Plus, Trash2, Calendar, TrendingUp, DollarSign } from 'lucide-react';
import { MonthRecord, DailyEntry } from '../types';
import { formatBRL } from '../utils/excel';

interface MonthDetailModalProps {
  month: MonthRecord | null;
  onClose: () => void;
  onUpdateMonth: (updated: MonthRecord) => void;
}

export const MonthDetailModal: React.FC<MonthDetailModalProps> = ({
  month,
  onClose,
  onUpdateMonth
}) => {
  if (!month) return null;

  const [newDay, setNewDay] = useState<string>('');
  const [newValue, setNewValue] = useState<string>('');
  const [newNote, setNewNote] = useState<string>('');

  const dailyEntries = [...month.dailyEntries].sort((a, b) => a.day - b.day);
  const values = dailyEntries.map((d) => d.value);
  const maxDayVal = values.length > 0 ? Math.max(...values) : 0;
  const avgDayVal = values.length > 0 ? month.total / values.length : 0;

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const dayNum = parseInt(newDay, 10);
    const val = parseFloat(newValue.replace(',', '.'));

    if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) {
      alert('Por favor, informe um dia válido (entre 1 e 31).');
      return;
    }
    if (isNaN(val) || val <= 0) {
      alert('Por favor, informe um valor positivo.');
      return;
    }

    const formattedDay = String(dayNum).padStart(2, '0');
    const formattedMonth = String(month.monthIndex + 1).padStart(2, '0');
    const entryId = `${month.id}-${formattedDay}-${Date.now()}`;

    const newEntry: DailyEntry = {
      id: entryId,
      date: `${month.year}-${formattedMonth}-${formattedDay}`,
      day: dayNum,
      value: val,
      notes: newNote.trim() || undefined
    };

    const updatedEntries = [...month.dailyEntries, newEntry];
    const newTotal = updatedEntries.reduce((acc, curr) => acc + curr.value, 0);

    onUpdateMonth({
      ...month,
      total: Number(newTotal.toFixed(2)),
      dailyEntries: updatedEntries
    });

    setNewDay('');
    setNewValue('');
    setNewNote('');
  };

  const handleDeleteEntry = (entryId: string) => {
    const updatedEntries = month.dailyEntries.filter((d) => d.id !== entryId);
    const newTotal = updatedEntries.reduce((acc, curr) => acc + curr.value, 0);

    onUpdateMonth({
      ...month,
      total: Number(newTotal.toFixed(2)),
      dailyEntries: updatedEntries
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">
                Movimentação Diária &bull; {month.monthLabel}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                Total: {formatBRL(month.total)}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Lançamentos detalhados de cada dia do mês de {month.monthLabel}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Month Metrics */}
        <div className="grid grid-cols-3 gap-3 p-6 bg-slate-50/50 border-b border-slate-200 text-xs">
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500">Dias com Vendas</span>
            <div className="text-base font-bold text-slate-900 mt-1 flex items-center gap-1">
              <Calendar className="w-4 h-4 text-slate-400" />
              {dailyEntries.length} dias
            </div>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500">Média Diária</span>
            <div className="text-base font-bold text-slate-900 mt-1 flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              {formatBRL(avgDayVal)}
            </div>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500">Maior Entrada do Mês</span>
            <div className="text-base font-bold text-slate-900 mt-1 flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              {formatBRL(maxDayVal)}
            </div>
          </div>
        </div>

        {/* Notes / Aluguel if present */}
        {(month.notes && month.notes.length > 0 || month.aluguel) && (
          <div className="px-6 py-3 bg-amber-50/70 border-b border-amber-200 text-xs text-amber-900 flex flex-wrap gap-4">
            {month.aluguel && (
              <div>
                <span className="font-semibold">Aluguel:</span> {formatBRL(month.aluguel)}
              </div>
            )}
            {month.notes?.map((n, idx) => (
              <div key={idx}>
                <span className="font-semibold">Nota:</span> {n}
              </div>
            ))}
          </div>
        )}

        {/* Entries Table */}
        <div className="p-6 max-h-80 overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3">Dia</th>
                <th className="py-2.5 px-3">Data</th>
                <th className="py-2.5 px-3">Valor de Entrada</th>
                <th className="py-2.5 px-3">Observações</th>
                <th className="py-2.5 px-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dailyEntries.map((entry) => {
                const isMax = entry.value === maxDayVal && maxDayVal > 0;
                return (
                  <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      Dia {entry.day}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {entry.day}/{month.monthIndex + 1}/{month.year}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      <span className={isMax ? 'text-emerald-700 font-bold flex items-center gap-1' : ''}>
                        {formatBRL(entry.value)}
                        {isMax && <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-sm font-semibold">Maior do mês</span>}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {entry.notes || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                        title="Remover lançamento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {dailyEntries.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    Nenhum lançamento diário cadastrado para este mês.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Quick Add Day Form */}
        <form onSubmit={handleAddEntry} className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center gap-2.5 text-xs">
          <div className="w-20">
            <input
              type="number"
              min="1"
              max="31"
              placeholder="Dia"
              value={newDay}
              onChange={(e) => setNewDay(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          <div className="w-36">
            <input
              type="text"
              placeholder="Valor (R$)"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <input
              type="text"
              placeholder="Observação (opcional)"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Adicionar Dia
          </button>
        </form>
      </div>
    </div>
  );
};
