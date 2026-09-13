import React, { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { parseUploadedExcel, formatBRL } from '../utils/excel';
import { MonthRecord } from '../types';

interface UploadExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedMonths: MonthRecord[], mode: 'merge' | 'replace') => void;
}

export const UploadExcelModal: React.FC<UploadExcelModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess
}) => {
  if (!isOpen) return null;

  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<{
    months: MonthRecord[];
    totalImported: number;
  } | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setLoading(true);

    try {
      const result = await parseUploadedExcel(selectedFile);
      if (result.months.length === 0) {
        throw new Error('Nenhum dado mensal reconhecido na planilha enviada. Verifique se possui colunas de data e valor.');
      }
      setParsedPreview(result);
    } catch (err: any) {
      setError(err.message || 'Falha ao processar arquivo Excel.');
      setParsedPreview(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (!parsedPreview) return;
    onImportSuccess(parsedPreview.months, importMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Importar Planilha de Movimentação
              </h3>
              <p className="text-xs text-slate-500">
                Carregue um arquivo .xlsx, .xls ou .csv da sua loja
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

        <div className="p-6 space-y-4">
          {/* Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/50'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
            />
            <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-400 mb-2" />
            <div className="text-sm font-semibold text-slate-700">
              {file ? file.name : 'Arraste a planilha aqui ou clique para selecionar'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Formatos suportados: Excel (.xlsx, .xls) ou CSV
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-3 text-sm text-slate-600 gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
              Processando planilha...
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Erro ao processar arquivo:</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Preview */}
          {parsedPreview && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-2">
              <div className="flex items-center text-emerald-800 font-bold gap-1.5 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Planilha identificada com sucesso!
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-700 pt-1">
                <div>
                  <span className="text-slate-500">Meses encontrados:</span>{' '}
                  <span className="font-bold">{parsedPreview.months.length}</span>
                </div>
                <div>
                  <span className="text-slate-500">Total calculado:</span>{' '}
                  <span className="font-bold text-emerald-700">{formatBRL(parsedPreview.totalImported)}</span>
                </div>
              </div>

              {/* Mode Selection */}
              <div className="pt-2 border-t border-emerald-200/60 mt-2">
                <label className="block text-slate-600 font-semibold mb-1">
                  Como deseja integrar os dados?
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="mode"
                      value="merge"
                      checked={importMode === 'merge'}
                      onChange={() => setImportMode('merge')}
                      className="text-emerald-600"
                    />
                    <span>Mesclar / Atualizar meses existentes</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="mode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="text-emerald-600"
                    />
                    <span>Substituir tudo</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={!parsedPreview}
              onClick={handleConfirmImport}
              className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors shadow-xs ${
                parsedPreview
                  ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              Aplicar na Planilha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
