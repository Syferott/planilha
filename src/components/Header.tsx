import React from 'react';
import { Download, Upload, Plus, Store, Sparkles, Laptop } from 'lucide-react';
import { formatBRL } from '../utils/excel';

interface HeaderProps {
  totalRevenue: number;
  monthsCount: number;
  onExportExcel: () => void;
  onOpenUploadModal: () => void;
  onOpenAddModal: () => void;
  onOpenExeModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalRevenue,
  monthsCount,
  onExportExcel,
  onOpenUploadModal,
  onOpenAddModal,
  onOpenExeModal
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
          {/* Brand & Context */}
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Movimentação da Loja
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Sparkles className="w-3 h-3 mr-1 text-emerald-600" /> Planilha Aprimorada
                </span>
              </div>
              <p className="text-sm text-slate-500">
                Acompanhamento visual de entradas financeiras mês a mês &bull; {monthsCount} meses monitorados ({formatBRL(totalRevenue)})
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-export-exe"
              onClick={onOpenExeModal}
              className="inline-flex items-center justify-center px-3.5 py-2 text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors shadow-2xs focus:ring-2 focus:ring-slate-400 focus:outline-hidden"
              title="Instalar no Windows ou gerar executável .EXE"
            >
              <Laptop className="w-4 h-4 mr-1.5 text-blue-600" />
              Exportar .EXE / Instalar
            </button>

            <button
              id="btn-import-excel"
              onClick={onOpenUploadModal}
              className="inline-flex items-center justify-center px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              title="Importar planilha Excel ou CSV"
            >
              <Upload className="w-4 h-4 mr-2 text-slate-500" />
              Importar Planilha
            </button>

            <button
              id="btn-add-entry"
              onClick={onOpenAddModal}
              className="inline-flex items-center justify-center px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <Plus className="w-4 h-4 mr-1.5 text-emerald-600" />
              Novo Lançamento
            </button>

            <button
              id="btn-export-excel"
              onClick={onExportExcel}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-colors focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              title="Baixar planilha completa em formato Excel (.xlsx)"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar Planilha (.xlsx)
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
