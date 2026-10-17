import React, { useState } from 'react';
import type { SubInvoice } from '../domain/types';
import { Receipt, Percent, Tag, Sliders, Check, Edit2 } from 'lucide-react';
import './InvoiceDetailsCard.css';

interface InvoiceDetailsCardProps {
  subInvoice: SubInvoice;
  currency: string;
  onUpdate: (updates: Partial<SubInvoice>) => void;
}

export const InvoiceDetailsCard: React.FC<InvoiceDetailsCardProps> = ({ subInvoice, currency, onUpdate }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(subInvoice.title);

  const handleSaveTitle = () => {
    onUpdate({ title: titleInput.trim() || 'Ticket sin título' });
    setIsEditingTitle(false);
  };

  return (
    <div className="card">
      <div className="invoice-details-header">
        <div className="invoice-title-area">
          <Receipt className="invoice-details-icon" size={20} />
          {isEditingTitle ? (
            <div className="inline-edit-group">
              <input
                type="text"
                className="form-input"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                autoFocus
              />
              <button onClick={handleSaveTitle} className="btn btn-sm btn-primary">
                <Check size={14} />
              </button>
            </div>
          ) : (
            <div className="invoice-title-click" onClick={() => setIsEditingTitle(true)}>
              <h2 className="card-title margin-zero">{subInvoice.title}</h2>
              <Edit2 size={14} className="edit-icon-hint" />
            </div>
          )}
        </div>

        {/* Split Mode Selector */}
        <div className="split-mode-selector">
          <button
            type="button"
            className={`split-mode-btn ${subInvoice.splitMode === 'equal' ? 'active' : ''}`}
            onClick={() => onUpdate({ splitMode: 'equal' })}
          >
            Equitativo
          </button>
          <button
            type="button"
            className={`split-mode-btn ${subInvoice.splitMode === 'itemized' ? 'active' : ''}`}
            onClick={() => onUpdate({ splitMode: 'itemized' })}
          >
            Por Ítems / Persona
          </button>
        </div>
      </div>

      <div className="form-grid">
        {/* Fecha y Título corto */}
        <div className="form-group">
          <label className="form-label">Fecha del ticket</label>
          <input
            type="date"
            value={subInvoice.date}
            onChange={(e) => onUpdate({ date: e.target.value })}
            className="form-input"
          />
        </div>

        {/* Impuestos (Tax) */}
        <div className="form-group">
          <div className="form-label-row">
            <label className="form-label">
              <Percent size={14} /> Impuestos (%)
            </label>
            <label className="switch" title="Activar / Desactivar impuestos">
              <input
                type="checkbox"
                checked={subInvoice.taxEnabled}
                onChange={(e) => onUpdate({ taxEnabled: e.target.checked })}
              />
              <span className="switch-slider"></span>
            </label>
          </div>
          <div className={`input-with-disabled ${!subInvoice.taxEnabled ? 'disabled' : ''}`}>
            <input
              type="number"
              min="0"
              step="0.1"
              value={subInvoice.taxPercentage}
              onChange={(e) => onUpdate({ taxPercentage: parseFloat(e.target.value) || 0 })}
              disabled={!subInvoice.taxEnabled}
              className="form-input"
              placeholder="0"
            />
          </div>
        </div>

        {/* Propina (Tip) */}
        <div className="form-group">
          <div className="form-label-row">
            <label className="form-label">
              <Sliders size={14} /> Propina (%)
            </label>
            <label className="switch" title="Activar / Desactivar propina">
              <input
                type="checkbox"
                checked={subInvoice.tipEnabled}
                onChange={(e) => onUpdate({ tipEnabled: e.target.checked })}
              />
              <span className="switch-slider"></span>
            </label>
          </div>
          <div className={`input-with-disabled ${!subInvoice.tipEnabled ? 'disabled' : ''}`}>
            <input
              type="number"
              min="0"
              step="0.1"
              value={subInvoice.tipPercentage}
              onChange={(e) => onUpdate({ tipPercentage: parseFloat(e.target.value) || 0 })}
              disabled={!subInvoice.tipEnabled}
              className="form-input"
              placeholder="0"
            />
          </div>
        </div>

        {/* Descuento (Discount) */}
        <div className="form-group">
          <div className="form-label-row">
            <label className="form-label">
              <Tag size={14} /> Descuento ({currency})
            </label>
            <label className="switch" title="Activar / Desactivar descuento">
              <input
                type="checkbox"
                checked={subInvoice.discountEnabled}
                onChange={(e) => onUpdate({ discountEnabled: e.target.checked })}
              />
              <span className="switch-slider"></span>
            </label>
          </div>
          <div className={`input-with-disabled ${!subInvoice.discountEnabled ? 'disabled' : ''}`}>
            <input
              type="number"
              min="0"
              step="0.5"
              value={subInvoice.discountAmount}
              onChange={(e) => onUpdate({ discountAmount: parseFloat(e.target.value) || 0 })}
              disabled={!subInvoice.discountEnabled}
              className="form-input"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
