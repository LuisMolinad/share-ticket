import React from 'react';
import type { CalculationResult, Invoice } from '../domain/types';
import { Calculator, FileDown, CheckCircle2 } from 'lucide-react';
import './SummaryView.css';

interface SummaryViewProps {
  invoice: Invoice;
  result: CalculationResult;
  onExportPDF: () => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({ invoice, result, onExportPDF }) => {
  const currency = invoice.currency;

  return (
    <div className="summary-container">
      {/* Global Totals Banner */}
      <div className="summary-banner">
        <div>
          <span className="summary-badge">
            Resumen General de Gastos
          </span>
          <h2 className="summary-main-title">
            Total Final: {currency}{result.grandTotal.toFixed(2)}
          </h2>
          <p className="summary-subtitle-text">
            {invoice.participants.length} participantes • {invoice.items.length} ítems registrados
          </p>
        </div>

        <div className="summary-stats">
          <div>
            <p className="stat-label">Subtotal</p>
            <p className="stat-value">{currency}{result.subtotal.toFixed(2)}</p>
          </div>
          <div>
            <p className="stat-label">Descuento</p>
            <p className="stat-value">-{currency}{result.totalDiscount.toFixed(2)}</p>
          </div>
          <div>
            <p className="stat-label">Impuestos ({invoice.taxPercentage}%)</p>
            <p className="stat-value">{currency}{result.totalTax.toFixed(2)}</p>
          </div>
          <div>
            <p className="stat-label">Propina ({invoice.tipPercentage}%)</p>
            <p className="stat-value">{currency}{result.totalTip.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Per Participant Breakdown Cards */}
      <div className="card">
        <div className="summary-top-row">
          <h3 className="card-title margin-zero">
            <Calculator />
            <span>Desglose por Persona</span>
          </h3>

          <button
            onClick={onExportPDF}
            disabled={result.shares.length === 0 || result.subtotal === 0}
            className="btn btn-primary"
          >
            <FileDown size={16} />
            <span>Descargar Reporte PDF</span>
          </button>
        </div>

        {result.shares.length === 0 ? (
          <div className="empty-state">
            Agrega participantes e ítems para ver el desglose detallado.
          </div>
        ) : (
          <div className="participants-grid">
            {result.shares.map((share) => (
              <div key={share.participantId} className="participant-card">
                <div>
                  <div className="participant-header">
                    <div className="participant-info-name">
                      <span className="participant-dot" style={{ backgroundColor: share.participantColor }} />
                      <h4 className="participant-name-text">{share.participantName}</h4>
                    </div>
                    <span className="participant-total-amount">
                      {currency}{share.total.toFixed(2)}
                    </span>
                  </div>

                  <div className="participant-breakdown">
                    <div className="breakdown-row">
                      <span>Subtotal ítems:</span>
                      <span className="summary-subtotal-text">{currency}{share.subtotal.toFixed(2)}</span>
                    </div>
                    {share.discountShare > 0 && (
                      <div className="breakdown-row discount">
                        <span>Descuento proporcional:</span>
                        <span className="summary-discount-text">-{currency}{share.discountShare.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="breakdown-row">
                      <span>Impuestos ({invoice.taxPercentage}%):</span>
                      <span className="summary-tax-text">{currency}{share.taxShare.toFixed(2)}</span>
                    </div>
                    <div className="breakdown-row">
                      <span>Propina ({invoice.tipPercentage}%):</span>
                      <span className="summary-tip-text">{currency}{share.tipShare.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="assigned-items-section">
                    <p className="assigned-items-title">Consumos asignados:</p>
                    {share.assignedItems.length === 0 ? (
                      <p className="summary-empty-items">Sin ítems específicos.</p>
                    ) : (
                      <ul className="assigned-items-list">
                        {share.assignedItems.map((item, idx) => (
                          <li key={idx} className="assigned-item-row">
                            <span className="summary-item-name" title={item.itemName}>
                              • {item.itemName} <span className="summary-item-qty-hint">({item.quantity % 1 === 0 ? item.quantity : item.quantity.toFixed(1)}x)</span>
                            </span>
                            <span className="summary-item-price">{currency}{item.share.toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="participant-footer">
                  <span>Estado: Pendiente de pago</span>
                  <CheckCircle2 size={16} color="#9ca3af" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
