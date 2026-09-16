import React from 'react';
import { Receipt, FileDown, RefreshCw } from 'lucide-react';
import type { Invoice } from '../domain/types';
import './Header.css';

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
    <header className="app-header">
      <div className="header-inner">
        <div className="header-brand">
          <div className="header-logo">
            <Receipt size={28} />
          </div>
          <div>
            <h1 className="header-title">ShareTicket</h1>
            <p className="header-subtitle">Calculadora inteligente de facturas y división de gastos</p>
          </div>
        </div>

        <div className="header-actions">
          <div className="mode-toggle">
            <button
              onClick={() => onUpdateDetails({ splitMode: 'equal' })}
              className={`mode-btn ${invoice.splitMode === 'equal' ? 'active' : ''}`}
            >
              División Equitativa
            </button>
            <button
              onClick={() => onUpdateDetails({ splitMode: 'itemized' })}
              className={`mode-btn ${invoice.splitMode === 'itemized' ? 'active' : ''}`}
            >
              Por Ítems / Platos
            </button>
          </div>

          <button
            onClick={onReset}
            title="Reiniciar factura"
            className="btn-icon"
          >
            <RefreshCw size={20} />
          </button>

          <button
            onClick={onExportPDF}
            disabled={participantCount === 0 || itemCount === 0}
            className="btn btn-primary"
          >
            <FileDown size={16} />
            <span>Generar PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
};
