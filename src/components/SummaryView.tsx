import React from 'react';
import type { CalculationResult, Invoice } from '../domain/types';
import { Calculator, FileDown, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import './SummaryView.css';

interface SummaryViewProps {
  invoice: Invoice;
  result: CalculationResult;
  onExportPDF: () => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({ invoice, result, onExportPDF }) => {
  const currency = invoice.currency;
  const [expandedParticipantId, setExpandedParticipantId] = React.useState<string | null>(null);

  const toggleExpand = (pId: string) => {
    setExpandedParticipantId(expandedParticipantId === pId ? null : pId);
  };

  return (
    <div className="summary-container">
      {/* Global Totals Banner */}
      <div className="summary-banner">
        <div>
          <span className="summary-badge">
            Resumen General de Gastos ({invoice.subInvoices.length} tickets)
          </span>
          <h2 className="summary-main-title">
            Total Consolidado: {currency}{result.grandTotal.toFixed(2)}
          </h2>
          <p className="summary-subtitle-text">
            {invoice.participants.length} participantes • Todos los tickets consolidados
          </p>
        </div>

        <div className="summary-stats">
          <div>
            <p className="stat-label">Subtotal</p>
            <p className="stat-value">{currency}{result.subtotal.toFixed(2)}</p>
          </div>
          <div>
            <p className="stat-label">Descuentos</p>
            <p className="stat-value">
              {result.totalDiscount > 0 ? `-${currency}${result.totalDiscount.toFixed(2)}` : '—'}
            </p>
          </div>
          <div>
            <p className="stat-label">Impuestos</p>
            <p className="stat-value">
              {result.totalTax > 0 ? `${currency}${result.totalTax.toFixed(2)}` : '—'}
            </p>
          </div>
          <div>
            <p className="stat-label">Propinas</p>
            <p className="stat-value">
              {result.totalTip > 0 ? `${currency}${result.totalTip.toFixed(2)}` : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Per Participant Breakdown Cards */}
      <div className="card">
        <div className="summary-top-row">
          <h3 className="card-title margin-zero">
            <Calculator />
            <span>Desglose Consolidado por Persona</span>
          </h3>

          <button
            onClick={onExportPDF}
            disabled={result.shares.length === 0 || result.subtotal === 0}
            className="btn btn-primary"
          >
            <FileDown size={16} />
            <span>Descargar Reporte PDF Global</span>
          </button>
        </div>

        {result.shares.length === 0 ? (
          <div className="empty-state">
            Agrega participantes e ítems en tus tickets para ver el desglose detallado.
          </div>
        ) : (
          <div className="participants-grid">
            {result.shares.map((share) => {
              const isExpanded = expandedParticipantId === share.participantId;
              return (
                <div key={share.participantId} className={`participant-card ${isExpanded ? 'expanded' : ''}`}>
                  <div>
                    <div className="participant-header">
                      <div className="participant-info-name">
                        <span className="participant-dot" style={{ backgroundColor: share.participantColor }} />
                        <h4 className="participant-name-text">{share.participantName}</h4>
                      </div>
                      <div className="participant-header-right">
                        <span className="participant-total-amount">
                          {currency}{share.total.toFixed(2)}
                        </span>
                        <button
                          type="button"
                          className="btn-expand-toggle"
                          onClick={() => toggleExpand(share.participantId)}
                          title="Ver desglose por ticket"
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="participant-breakdown">
                      <div className="breakdown-row">
                        <span>Subtotal general:</span>
                        <span className="summary-subtotal-text">{currency}{share.subtotal.toFixed(2)}</span>
                      </div>
                      {share.discountShare > 0 && (
                        <div className="breakdown-row discount">
                          <span>Descuento proporcional:</span>
                          <span className="summary-discount-text">-{currency}{share.discountShare.toFixed(2)}</span>
                        </div>
                      )}
                      {share.taxShare > 0 && (
                        <div className="breakdown-row">
                          <span>Impuestos totales:</span>
                          <span className="summary-tax-text">{currency}{share.taxShare.toFixed(2)}</span>
                        </div>
                      )}
                      {share.tipShare > 0 && (
                        <div className="breakdown-row">
                          <span>Propinas totales:</span>
                          <span className="summary-tip-text">{currency}{share.tipShare.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    {/* Desglose por ticket si está expandido */}
                    {isExpanded && (
                      <div className="ticket-breakdown-section">
                        <p className="ticket-breakdown-title">Desglose por Ticket:</p>
                        {share.ticketBreakdowns.map((tb) => (
                          <div key={tb.subInvoiceId} className="ticket-breakdown-item">
                            <div className="tb-header">
                              <span className="tb-title">🎫 {tb.subInvoiceTitle}</span>
                              <span className="tb-total">{currency}{tb.total.toFixed(2)}</span>
                            </div>
                            {tb.assignedItems.length > 0 && (
                              <ul className="tb-items-list">
                                {tb.assignedItems.map((item, iIdx) => (
                                  <li key={iIdx} className="tb-item-row">
                                    <span>• {item.itemName.replace(/\[.*?\]\s*/, '')} ({item.quantity % 1 === 0 ? item.quantity : item.quantity.toFixed(1)}x)</span>
                                    <span>{currency}{item.share.toFixed(2)}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="assigned-items-section">
                      <p className="assigned-items-title">Todos los consumos asignados ({share.assignedItems.length}):</p>
                      {share.assignedItems.length === 0 ? (
                        <p className="summary-empty-items">Sin ítems específicos.</p>
                      ) : (
                        <ul className="assigned-items-list">
                          {share.assignedItems.map((item, idx) => (
                            <li key={idx} className="assigned-item-row">
                              <span className="summary-item-name" title={item.itemName}>
                                • {item.itemName}
                              </span>
                              <span className="summary-item-price">{currency}{item.share.toFixed(2)}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className="participant-footer">
                    <span>Estado: Pendiente</span>
                    <CheckCircle2 size={16} color="#9ca3af" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
