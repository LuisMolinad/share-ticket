import React from 'react';
import type { CalculationResult, Invoice } from '../domain/types';
import { Calculator, FileDown, CheckCircle2, ChevronDown, ChevronUp, FileSpreadsheet } from 'lucide-react';
import { formatAmount } from '../utils/formatters';
import './SummaryView.css';

interface SummaryViewProps {
  invoice: Invoice;
  result: CalculationResult;
  onExportPDF: () => void;
  onExportSheets: () => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({ invoice, result, onExportPDF, onExportSheets }) => {
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
             Total Consolidado: {currency}{formatAmount(result.grandTotal)}
           </h2>
           <p className="summary-subtitle-text">
             {invoice.participants.length} participantes • Todos los tickets consolidados
           </p>
         </div>

         <div className="summary-stats">
           <div>
             <p className="stat-label">Subtotal</p>
             <p className="stat-value">{currency}{formatAmount(result.subtotal)}</p>
           </div>
           <div>
             <p className="stat-label">Descuentos</p>
             <p className="stat-value">
               {result.totalDiscount > 0 ? `-${currency}${formatAmount(result.totalDiscount)}` : '—'}
             </p>
           </div>
           <div>
             <p className="stat-label">Impuestos</p>
             <p className="stat-value">
               {result.totalTax > 0 ? `${currency}${formatAmount(result.totalTax)}` : '—'}
             </p>
           </div>
           <div>
             <p className="stat-label">Propinas</p>
             <p className="stat-value">
               {result.totalTip > 0 ? `${currency}${formatAmount(result.totalTip)}` : '—'}
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

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={onExportSheets}
              disabled={result.shares.length === 0 || result.subtotal === 0}
              className="btn btn-secondary"
              title="Exportar a Google Sheets / Excel con fórmulas"
            >
              <FileSpreadsheet size={16} />
              <span>Google Sheets (Fórmulas)</span>
            </button>

            <button
              onClick={onExportPDF}
              disabled={result.shares.length === 0 || result.subtotal === 0}
              className="btn btn-primary"
            >
              <FileDown size={16} />
              <span>Descargar Reporte PDF Global</span>
            </button>
          </div>
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
                           {currency}{formatAmount(share.total)}
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
                         <span className="summary-subtotal-text">{currency}{formatAmount(share.subtotal)}</span>
                       </div>
                       {share.discountShare > 0 && (
                         <div className="breakdown-row discount">
                           <span>Descuento proporcional:</span>
                           <span className="summary-discount-text">-{currency}{formatAmount(share.discountShare)}</span>
                         </div>
                       )}
                       {share.taxShare > 0 && (
                         <div className="breakdown-row">
                           <span>Impuestos totales:</span>
                           <span className="summary-tax-text">{currency}{formatAmount(share.taxShare)}</span>
                         </div>
                       )}
                       {share.tipShare > 0 && (
                         <div className="breakdown-row">
                           <span>Propinas totales:</span>
                           <span className="summary-tip-text">{currency}{formatAmount(share.tipShare)}</span>
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
                               <span className="tb-total">{currency}{formatAmount(tb.total)}</span>
                             </div>
                             {tb.assignedItems.length > 0 && (
                               <ul className="tb-items-list">
                                 {tb.assignedItems.map((item, iIdx) => (
                                   <li key={iIdx} className="tb-item-row">
                                     <span>• {item.itemName.replace(/\[.*?\]\s*/, '')} ({item.quantity % 1 === 0 ? item.quantity : item.quantity.toFixed(1)}x)</span>
                                     <span>{currency}{formatAmount(item.share)}</span>
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
                               <span className="summary-item-price">{currency}{formatAmount(item.share)}</span>
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
