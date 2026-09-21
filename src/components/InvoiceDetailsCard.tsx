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
          <div className="field-head">
            <label className="form-label" htmlFor="tax-percentage">
              Impuestos (%)
            </label>
            <label className="switch" title={invoice.taxEnabled ? 'Impuestos activados' : 'Impuestos desactivados'}>
              <input
                type="checkbox"
                role="switch"
                aria-label="Activar o desactivar impuestos"
                checked={invoice.taxEnabled}
                onChange={(e) => onUpdate({ taxEnabled: e.target.checked })}
              />
              <span className="switch-slider" />
            </label>
          </div>
          <input
            id="tax-percentage"
            type="number"
            min="0"
            step="0.1"
            value={invoice.taxPercentage}
            onChange={(e) => onUpdate({ taxPercentage: parseFloat(e.target.value) || 0 })}
            disabled={!invoice.taxEnabled}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <div className="field-head">
            <label className="form-label" htmlFor="tip-percentage">
              Propina (%)
            </label>
            <label className="switch" title={invoice.tipEnabled ? 'Propina activada' : 'Propina desactivada'}>
              <input
                type="checkbox"
                role="switch"
                aria-label="Activar o desactivar propina"
                checked={invoice.tipEnabled}
                onChange={(e) => onUpdate({ tipEnabled: e.target.checked })}
              />
              <span className="switch-slider" />
            </label>
          </div>
          <input
            id="tip-percentage"
            type="number"
            min="0"
            step="0.1"
            value={invoice.tipPercentage}
            onChange={(e) => onUpdate({ tipPercentage: parseFloat(e.target.value) || 0 })}
            disabled={!invoice.tipEnabled}
            className="form-input"
          />
        </div>

        <div className="form-group col-span-2">
          <div className="field-head">
            <label className="form-label" htmlFor="discount-amount">
              Descuento Total ({invoice.currency})
            </label>
            <label
              className="switch"
              title={invoice.discountEnabled ? 'Descuento activado' : 'Descuento desactivado'}
            >
              <input
                type="checkbox"
                role="switch"
                aria-label="Activar o desactivar descuento"
                checked={invoice.discountEnabled}
                onChange={(e) => onUpdate({ discountEnabled: e.target.checked })}
              />
              <span className="switch-slider" />
            </label>
          </div>
          <input
            id="discount-amount"
            type="number"
            min="0"
            step="0.1"
            value={invoice.discountAmount}
            onChange={(e) => onUpdate({ discountAmount: parseFloat(e.target.value) || 0 })}
            disabled={!invoice.discountEnabled}
            className="form-input"
          />
        </div>
      </div>
    </div>
  );
};
