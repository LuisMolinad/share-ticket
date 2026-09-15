import React from 'react';
import { Receipt, FileDown, RefreshCw } from 'lucide-react';
import type { Invoice } from '../domain/types';

interface HeaderProps {
  invoice: Invoice;
  onUpdateDetails: (updates: Partial<Invoice>) => void;
  onReset: () => void;
  onExportPDF: () => void;
  participantCount: number;
  itemCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  invoice,
  onUpdateDetails,
  onReset,
  onExportPDF,
  participantCount,
  itemCount,
}) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-md">
            <Receipt className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">ShareTicket</h1>
            <p className="text-sm text-gray-500">Calculadora inteligente de facturas y división de gastos</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Split Mode Selector (Strategy Pattern switcher) */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => onUpdateDetails({ splitMode: 'equal' })}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                invoice.splitMode === 'equal'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              División Equitativa
            </button>
            <button
              onClick={() => onUpdateDetails({ splitMode: 'itemized' })}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                invoice.splitMode === 'itemized'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Por Ítems / Platos
            </button>
          </div>

          <button
            onClick={onReset}
            title="Reiniciar factura"
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          <button
            onClick={onExportPDF}
            disabled={participantCount === 0 || itemCount === 0}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-xl font-medium text-sm shadow-sm transition"
          >
            <FileDown className="w-4 h-4" />
            <span>Generar PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
};
