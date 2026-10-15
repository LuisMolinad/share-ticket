import React, { useState } from 'react';
import type { Invoice, SubInvoice } from '../domain/types';
import { Plus, Trash2, Receipt, FileDown, RotateCcw, DollarSign, Edit2, Check, FileSpreadsheet } from 'lucide-react';
import './Header.css';

interface HeaderProps {
  invoice: Invoice;
  activeSubInvoice: SubInvoice;
  onUpdateGroupDetails: (updates: Partial<Invoice>) => void;
  onAddSubInvoice: (title?: string) => void;
  onRemoveSubInvoice: (id: string) => void;
  onSelectSubInvoice: (id: string) => void;
  onReset: () => void;
  onExportPDF: () => void;
  onExportSheets: () => void;
  participantCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  invoice,
  activeSubInvoice,
  onUpdateGroupDetails,
  onAddSubInvoice,
  onRemoveSubInvoice,
  onSelectSubInvoice,
  onReset,
  onExportPDF,
  onExportSheets,
  participantCount,
}) => {
  const [newTicketTitle, setNewTicketTitle] = useState('');
  const [isAddingTicket, setIsAddingTicket] = useState(false);
  const [isEditingGroupName, setIsEditingGroupName] = useState(false);
  const [groupNameInput, setGroupNameInput] = useState(invoice.title);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    onAddSubInvoice(newTicketTitle || 'Nuevo Ticket');
    setNewTicketTitle('');
    setIsAddingTicket(false);
  };

  const handleSaveGroupName = () => {
    onUpdateGroupDetails({ title: groupNameInput.trim() || 'Gastos Grupales' });
    setIsEditingGroupName(false);
  };

  return (
    <header className="header">
      <div className="header-inner">
        {/* Top bar with group name and global actions */}
        <div className="header-top-row">
          <div className="brand-section">
            <Receipt className="brand-icon" size={28} />
            <div>
              <div className="brand-title-row">
                {isEditingGroupName ? (
                  <div className="inline-edit-group">
                    <input
                      type="text"
                      className="form-input group-title-input"
                      value={groupNameInput}
                      onChange={(e) => setGroupNameInput(e.target.value)}
                      autoFocus
                    />
                    <button onClick={handleSaveGroupName} className="btn btn-sm btn-primary">
                      <Check size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="brand-title-display" onClick={() => setIsEditingGroupName(true)}>
                    <h1 className="header-title">{invoice.title}</h1>
                    <Edit2 size={14} className="edit-icon-hint" />
                  </div>
                )}
              </div>
              <p className="header-subtitle">
                {participantCount} participantes • {invoice.subInvoices.length} tickets registrados
              </p>
            </div>
          </div>

          <div className="header-actions">
            <div className="currency-selector-wrapper">
              <DollarSign size={16} className="currency-icon" />
              <select
                value={invoice.currency}
                onChange={(e) => onUpdateGroupDetails({ currency: e.target.value })}
                className="form-select currency-select"
                title="Moneda"
              >
                <option value="$">$ (USD/ARS/CLP/COP)</option>
                <option value="€">€ (EUR)</option>
                <option value="£">£ (GBP)</option>
                <option value="S/.">S/. (PEN)</option>
                <option value="$0">MXN ($)</option>
              </select>
            </div>

            <button onClick={onReset} className="btn btn-secondary" title="Reiniciar todo">
              <RotateCcw size={16} />
              <span className="btn-text-responsive">Nuevo</span>
            </button>

            <button onClick={onExportSheets} className="btn btn-secondary" title="Exportar a Google Sheets / Excel con fórmulas">
              <FileSpreadsheet size={16} />
              <span>Sheets</span>
            </button>

            <button onClick={onExportPDF} className="btn btn-primary" title="Exportar Reporte PDF">
              <FileDown size={16} />
              <span>PDF Global</span>
            </button>
          </div>
        </div>

        {/* Multi-Ticket Tab Navigation Bar */}
        <div className="tickets-tab-bar">
          <div className="tickets-tabs-scroll">
            {invoice.subInvoices.map((sub) => {
              const isActive = sub.id === activeSubInvoice.id;
              return (
                <div
                  key={sub.id}
                  className={`ticket-tab ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectSubInvoice(sub.id)}
                >
                  <Receipt size={14} />
                  <span className="ticket-tab-title">{sub.title}</span>
                  {invoice.subInvoices.length > 1 && (
                    <button
                      type="button"
                      className="ticket-tab-remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveSubInvoice(sub.id);
                      }}
                      title="Eliminar este ticket"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {isAddingTicket ? (
            <form onSubmit={handleCreateTicket} className="add-ticket-form">
              <input
                type="text"
                placeholder="Nombre del ticket (ej. Taxis, Hotel)..."
                value={newTicketTitle}
                onChange={(e) => setNewTicketTitle(e.target.value)}
                className="form-input add-ticket-input"
                autoFocus
              />
              <button type="submit" className="btn btn-sm btn-primary">
                Añadir
              </button>
              <button
                type="button"
                onClick={() => setIsAddingTicket(false)}
                className="btn btn-sm btn-secondary"
              >
                ✕
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingTicket(true)}
              className="btn btn-sm btn-secondary add-ticket-btn"
            >
              <Plus size={16} />
              <span>Añadir Ticket / Gasto</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
