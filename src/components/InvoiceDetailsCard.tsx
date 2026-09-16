import React from 'react';
import type { Invoice } from '../domain/types';
import { Calendar, FileText } from 'lucide-react';
import './InvoiceDetailsCard.css';

interface InvoiceDetailsCardProps {
  invoice: Invoice;
  onUpdate: (updates: Partial<Invoice>) => void;
}

export const InvoiceDetailsCard: React.FC<InvoiceDetailsCardProps> = ({ invoice, onUpdate }) => {
  return (
    <div className="card">
      <h2 className="card-title">
        <FileText />
        <span>Detalles de la Factura</span>
      </h2>

      <div className="form-grid form-grid-6">
        <div className="form-group col-span-2">
          <label className="form-label">Concepto / Evento</label>
          <input
            type="text"
            value={invoice.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Ej. Cena de Cumpleaños"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Fecha</label>
          <div className="input-with-icon">
            <span className="input-icon">
              <Calendar size={16} />
            </span>
            <input
              type="date"
              value={invoice.date}
              onChange={(e) => onUpdate({ date: e.target.value })}
              className="form-input date-input-with-icon"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Moneda</label>
          <select
            value={invoice.currency}
            onChange={(e) => onUpdate({ currency: e.target.value })}
            className="form-select"
          >
            <option value="$">$ (USD / Pesos)</option>
            <option value="€">€ (EUR)</option>
            <option value="£">£ (GBP)</option>
            <option value="S/.">S/. (PEN)</option>
            <option value="$us">$us (BOB)</option>
            <option value="MXN$ ">MXN$</option>
            <option value="COL$ ">COL$</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Impuestos (%)</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={invoice.taxPercentage}
            onChange={(e) => onUpdate({ taxPercentage: parseFloat(e.target.value) || 0 })}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Propina (%)</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={invoice.tipPercentage}
            onChange={(e) => onUpdate({ tipPercentage: parseFloat(e.target.value) || 0 })}
            className="form-input"
          />
        </div>

        <div className="form-group col-span-2">
          <label className="form-label">Descuento Total ({invoice.currency})</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={invoice.discountAmount}
            onChange={(e) => onUpdate({ discountAmount: parseFloat(e.target.value) || 0 })}
            className="form-input"
          />
        </div>
      </div>
    </div>
  );
};
