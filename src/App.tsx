import React, { useState, useEffect } from 'react';
import { getInitialMonths } from './data/initialData';
import { MonthRecord, DailyEntry } from './types';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { MonthlyCharts } from './components/MonthlyCharts';
import { DataTable } from './components/DataTable';
import { MonthDetailModal } from './components/MonthDetailModal';
import { AddEntryModal } from './components/AddEntryModal';
import { UploadExcelModal } from './components/UploadExcelModal';
import { ExportExeModal } from './components/ExportExeModal';
import { exportToEnhancedExcel, formatBRL } from './utils/excel';
import { MONTH_SHORT } from './data/initialData';
import { FileSpreadsheet, Check, Sparkles, TrendingUp, Info, Laptop } from 'lucide-react';

const STORAGE_KEY = 'store_financial_movement_data_v1';

export default function App() {
  const [months, setMonths] = useState<MonthRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved months', e);
      }
    }
    return getInitialMonths();
  });

  const [selectedMonth, setSelectedMonth] = useState<MonthRecord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isExeModalOpen, setIsExeModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(months));
  }, [months]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Export to Excel
  const handleExportExcel = () => {
    try {
      exportToEnhancedExcel(months, 'Movimentacao_Loja_Aprimorada.xlsx');
      showToast('Planilha Excel (.xlsx) baixada com abas formatadas e fórmulas!');
    } catch (e) {
      console.error('Error exporting Excel', e);
      alert('Erro ao gerar arquivo Excel.');
    }
  };

  // Update a month's daily records
  const handleUpdateMonth = (updated: MonthRecord) => {
    setMonths((prev) =>
      prev.map((m) => (m.id === updated.id ? updated : m))
    );
    setSelectedMonth(updated);
    showToast(`Mês ${updated.monthLabel} atualizado com sucesso!`);
  };

  // Add single daily entry
  const handleAddEntry = ({
    date,
    value,
    notes
  }: {
    date: string;
    value: number;
    notes?: string;
  }) => {
    const parts = date.split('-');
    const year = parseInt(parts[0], 10);
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    const monthId = `${year}-${parts[1]}`;
    const entryId = `${monthId}-${parts[2]}-${Date.now()}`;
    const newEntry: DailyEntry = {
      id: entryId,
      date,
      day,
      value,
      notes
    };

    setMonths((prev) => {
      const existingIdx = prev.findIndex((m) => m.id === monthId);
      if (existingIdx !== -1) {
        const target = prev[existingIdx];
        const newDaily = [...target.dailyEntries, newEntry];
        const newTotal = newDaily.reduce((acc, curr) => acc + curr.value, 0);

        const updatedMonth: MonthRecord = {
          ...target,
          total: Number(newTotal.toFixed(2)),
          dailyEntries: newDaily
        };

        const copy = [...prev];
        copy[existingIdx] = updatedMonth;
        return copy;
      } else {
        // Create new month
        const newMonth: MonthRecord = {
          id: monthId,
          year,
          monthIndex,
          monthLabel: `${MONTH_SHORT[monthIndex]}/${String(year).slice(-2)}`,
          total: value,
          daysCount: 1,
          dailyEntries: [newEntry],
          notes: []
        };
        return [...prev, newMonth].sort((a, b) => {
          return a.year * 100 + a.monthIndex - (b.year * 100 + b.monthIndex);
        });
      }
    });

    showToast(`Entrada de ${formatBRL(value)} registrada com sucesso!`);
  };

  // Import from Excel
  const handleImportSuccess = (imported: MonthRecord[], mode: 'merge' | 'replace') => {
    if (mode === 'replace') {
      setMonths(imported);
    } else {
      setMonths((prev) => {
        const map = new Map<string, MonthRecord>();
        prev.forEach((m) => map.set(m.id, m));
        imported.forEach((m) => map.set(m.id, m));
        return Array.from(map.values()).sort(
          (a, b) => a.year * 100 + a.monthIndex - (b.year * 100 + b.monthIndex)
        );
      });
    }
    showToast(`Dados da planilha importados com sucesso (${imported.length} meses)!`);
  };

  // Reset to original data
  const handleResetToDefault = () => {
    if (confirm('Deseja restaurar os dados originais da sua loja extraídos da planilha enviada?')) {
      const initial = getInitialMonths();
      setMonths(initial);
      localStorage.removeItem(STORAGE_KEY);
      showToast('Dados originais restaurados com sucesso!');
    }
  };

  const totalRevenue = months.reduce((acc, m) => acc + m.total, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-800 flex items-center gap-2.5 text-sm animate-in slide-in-from-bottom-5 duration-200">
          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <Header
        totalRevenue={totalRevenue}
        monthsCount={months.length}
        onExportExcel={handleExportExcel}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenExeModal={() => setIsExeModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 space-y-6">
        {/* Banner Insight */}
        <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-2xl p-6 shadow-sm border border-emerald-800/30 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> Movimentação Financeira Consolidada
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Sua planilha aprimorada com gráficos visuais de entradas
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Todos os dados do seu histórico foram extraídos e organizados. Acompanhe a evolução de quanto está entrando na sua empresa mês a mês, compare anos e exporte o arquivo Excel atualizado quando precisar.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setIsExeModalOpen(true)}
              className="inline-flex items-center px-3.5 py-2.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl transition-all shadow-sm"
              title="Instalar no Windows ou gerar arquivo .exe"
            >
              <Laptop className="w-4 h-4 mr-1.5 text-blue-400" />
              Exportar .EXE
            </button>
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center px-4 py-2.5 text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 mr-1.5" />
              Baixar Excel Aprimorado
            </button>
            <button
              onClick={handleResetToDefault}
              className="text-xs text-slate-400 hover:text-white px-3 py-2 transition-colors underline"
              title="Restaurar dados originais da planilha enviada"
            >
              Restaurar Original
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <MetricCards months={months} />

        {/* Visual Charts - The core request of the user */}
        <MonthlyCharts
          months={months}
          onSelectMonth={(m) => setSelectedMonth(m)}
        />

        {/* Detailed Data Table */}
        <DataTable
          months={months}
          onSelectMonth={(m) => setSelectedMonth(m)}
        />

        {/* Informative footer tip */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-xs text-slate-600 flex items-start gap-3 shadow-2xs">
          <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-slate-800">
              Como funciona o acompanhamento visual das suas entradas:
            </p>
            <p>
              • <strong>Gráfico de Evolução:</strong> Mostra o montante que entrou em cada mês desde 2021 até 2025, com uma linha de média para você saber quais meses ficaram acima ou abaixo da média histórica.
            </p>
            <p>
              • <strong>Comparativo Ano a Ano:</strong> Permite confrontar o mesmo mês ao longo dos anos (ex: comparar todas as entradas de Maio de 2021 a 2025).
            </p>
            <p>
              • <strong>Planilha Excel (.xlsx):</strong> O botão "Baixar Planilha (.xlsx)" gera um arquivo Excel profissional com abas separadas para Resumo Mensal, Movimentação Diária e Consolidado Anual para seu controle pessoal.
            </p>
          </div>
        </div>
      </main>

      {/* Modals */}
      <MonthDetailModal
        month={selectedMonth}
        onClose={() => setSelectedMonth(null)}
        onUpdateMonth={handleUpdateMonth}
      />

      <AddEntryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        months={months}
        onAddEntry={handleAddEntry}
      />

      <UploadExcelModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />

      <ExportExeModal
        isOpen={isExeModalOpen}
        onClose={() => setIsExeModalOpen(false)}
      />
    </div>
  );
}
