import * as XLSX from 'xlsx';
import { MonthRecord, DailyEntry } from '../types';
import { MONTH_NAMES } from '../data/initialData';

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

/**
 * Generates and triggers download of enhanced Excel spreadsheet
 */
export function exportToEnhancedExcel(months: MonthRecord[], fileName = 'Movimentacao_Loja_Aprimorada.xlsx') {
  const wb = XLSX.utils.book_new();

  // 1. Sheet: Resumo Mensal
  const summaryData = months.map((m) => {
    const dailyVals = m.dailyEntries.map((d) => d.value);
    const maxDay = dailyVals.length > 0 ? Math.max(...dailyVals) : 0;
    const avgDay = dailyVals.length > 0 ? m.total / dailyVals.length : 0;

    return {
      'Período': m.monthLabel,
      'Ano': m.year,
      'Mês': MONTH_NAMES[m.monthIndex],
      'Total Entradas (R$)': Number(m.total.toFixed(2)),
      'Dias com Vendas': m.dailyEntries.length,
      'Média Diária (R$)': Number(avgDay.toFixed(2)),
      'Maior Entrada do Mês (R$)': Number(maxDay.toFixed(2)),
      'Aluguel Informado (R$)': m.aluguel ? Number(m.aluguel.toFixed(2)) : '',
      'Observações': (m.notes || []).join('; ')
    };
  });

  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  // Column widths
  wsSummary['!cols'] = [
    { wch: 12 }, { wch: 8 }, { wch: 14 }, { wch: 20 },
    { wch: 16 }, { wch: 18 }, { wch: 25 }, { wch: 22 }, { wch: 35 }
  ];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo Mês a Mês');

  // 2. Sheet: Detalhamento Diário
  const allDailyRows: Array<Record<string, string | number>> = [];
  months.forEach((m) => {
    m.dailyEntries.forEach((d) => {
      allDailyRows.push({
        'Data': d.date,
        'Dia': d.day,
        'Mês/Ano': m.monthLabel,
        'Ano': m.year,
        'Valor de Entrada (R$)': Number(d.value.toFixed(2)),
        'Observações': d.notes || ''
      });
    });
  });

  const wsDaily = XLSX.utils.json_to_sheet(allDailyRows);
  wsDaily['!cols'] = [
    { wch: 14 }, { wch: 8 }, { wch: 12 }, { wch: 8 }, { wch: 22 }, { wch: 30 }
  ];
  XLSX.utils.book_append_sheet(wb, wsDaily, 'Movimentação Diária');

  // 3. Sheet: Consolidado Anual
  const years = Array.from(new Set(months.map((m) => m.year))).sort((a, b) => a - b);
  const annualData = years.map((y) => {
    const yMonths = months.filter((m) => m.year === y);
    const yTotal = yMonths.reduce((acc, m) => acc + m.total, 0);
    const yAvg = yMonths.length > 0 ? yTotal / yMonths.length : 0;
    const best = [...yMonths].sort((a, b) => b.total - a.total)[0];

    return {
      'Ano': y,
      'Total de Entradas (R$)': Number(yTotal.toFixed(2)),
      'Meses Registrados': yMonths.length,
      'Média Mensal (R$)': Number(yAvg.toFixed(2)),
      'Melhor Mês': best ? `${best.monthLabel} (${formatBRL(best.total)})` : '-'
    };
  });

  const wsAnnual = XLSX.utils.json_to_sheet(annualData);
  wsAnnual['!cols'] = [
    { wch: 10 }, { wch: 24 }, { wch: 18 }, { wch: 20 }, { wch: 28 }
  ];
  XLSX.utils.book_append_sheet(wb, wsAnnual, 'Consolidado por Ano');

  // Write and trigger download
  XLSX.writeFile(wb, fileName);
}

/**
 * Parses uploaded Excel / CSV file to extract entries
 */
export async function parseUploadedExcel(file: File): Promise<{
  months: MonthRecord[];
  totalImported: number;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Grab first sheet or sheet with "Movimentação" / "Diária" or "Resumo"
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

        if (!rows || rows.length < 2) {
          throw new Error('A planilha está vazia ou sem dados legíveis.');
        }

        // Try to identify structure: is it tabular with [Date, Value] or multiple columns?
        const monthMap = new Map<string, { year: number; month: number; label: string; total: number; days: DailyEntry[] }>();

        // Check if header row contains recognizable columns
        const headerRow = rows[0].map((c) => String(c).trim().toLowerCase());
        const dateIdx = headerRow.findIndex((c) => c.includes('data') || c.includes('dia') || c.includes('date'));
        const valIdx = headerRow.findIndex((c) => c.includes('valor') || c.includes('entrada') || c.includes('total') || c.includes('value'));

        if (dateIdx !== -1 && valIdx !== -1) {
          // Standard tabular format
          for (let i = 1; i < rows.length; i++) {
            const r = rows[i];
            const rawDate = r[dateIdx];
            const rawVal = r[valIdx];
            if (!rawDate && !rawVal) continue;

            const numVal = parseFloat(String(rawVal).replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
            if (isNaN(numVal) || numVal <= 0) continue;

            // Date parsing
            let dObj = new Date();
            if (typeof rawDate === 'number') {
              // Excel serial date
              dObj = new Date((rawDate - (25567 + 2)) * 86400 * 1000);
            } else {
              const strDate = String(rawDate).trim();
              const parts = strDate.split(/[/.-]/);
              if (parts.length === 3) {
                // DD/MM/YYYY
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1;
                let year = parseInt(parts[2], 10);
                if (year < 100) year += 2000;
                dObj = new Date(year, month, day);
              }
            }

            if (isNaN(dObj.getTime())) continue;

            const y = dObj.getFullYear();
            const m = dObj.getMonth();
            const d = dObj.getDate();
            const key = `${y}-${String(m + 1).padStart(2, '0')}`;
            const label = `${MONTH_NAMES[m].slice(0, 3)}/${String(y).slice(-2)}`;

            if (!monthMap.has(key)) {
              monthMap.set(key, { year: y, month: m, label, total: 0, days: [] });
            }

            const mRecord = monthMap.get(key)!;
            mRecord.total += numVal;
            mRecord.days.push({
              id: `${key}-${d}-${i}`,
              date: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
              day: d,
              value: numVal,
              notes: r[valIdx + 1] ? String(r[valIdx + 1]) : undefined
            });
          }
        }

        const parsedMonths: MonthRecord[] = Array.from(monthMap.entries()).map(([id, data]) => ({
          id,
          year: data.year,
          monthIndex: data.month,
          monthLabel: data.label,
          total: Number(data.total.toFixed(2)),
          daysCount: data.days.length,
          dailyEntries: data.days,
          notes: []
        }));

        resolve({
          months: parsedMonths,
          totalImported: parsedMonths.reduce((acc, m) => acc + m.total, 0)
        });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
