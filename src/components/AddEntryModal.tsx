import React, { useState } from 'react';
import { X, Plus, Calendar, DollarSign, FileText } from 'lucide-react';
import { MonthRecord, DailyEntry } from '../types';
import { MONTH_NAMES, MONTH_SHORT } from '../data/initialData';

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  months: MonthRecord[];
  onAddEntry: (entry: {
    date: string;
    value: number;
    notes?: string;
  }) => void;
}

export const AddEntryModal: React.FC<AddEntryModalProps> = ({
  isOpen,
  onClose,
  months,
  onAddEntry
}) => {
  if (!isOpen) return null;

  const today = new Date();
  const defaultDateStr = today.toISOString().split('T')[0];

  const [date, setDate] = useState<string>(defaultDateStr);
  const [value, setValue] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numVal = parseFloat(value.replace(/\./g, '').replace(',', '.'));

    if (!date) {
      alert('Selecione uma data.');
      return;
    }
    if (isNaN(numVal) || numVal <= 0) {
      alert('Informe um valor de entrada válido maior que zero.');
      return;
    }

    onAddEntry({
      date,
      value: numVal,
      notes: notes.trim() || undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Novo Lançamento de Entrada
              </h3>
              <p className="text-xs text-slate-500">
                Adicione uma movimentação financeira na planilha
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Data da Movimentação
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              Valor da Entrada (R$)
            </label>
            <input
              type="text"
              placeholder="Ex: 850,00 ou 1250.50"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Observação / Descrição (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Venda balcão, informática, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg transition-colors shadow-xs"
            >
              Salvar Entrada
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
