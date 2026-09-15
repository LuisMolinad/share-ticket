import React from 'react';
import type { CalculationResult, Invoice } from '../domain/types';
import { Calculator, FileDown, CheckCircle2 } from 'lucide-react';

interface SummaryViewProps {
  invoice: Invoice;
  result: CalculationResult;
  onExportPDF: () => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({ invoice, result, onExportPDF }) => {
  const currency = invoice.currency;

  return (
    <div className="space-y-6">
      {/* Global Totals Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl shadow-md text-white p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="bg-indigo-500/40 text-indigo-100 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            Resumen General de Gastos
          </span>
          <h2 className="text-3xl font-bold mt-2 tracking-tight">
            Total Final: {currency}{result.grandTotal.toFixed(2)}
          </h2>
          <p className="text-indigo-100 text-sm mt-1">
            {invoice.participants.length} participantes • {invoice.items.length} ítems registrados
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl text-center w-full md:w-auto">
          <div>
            <p className="text-xs text-indigo-200">Subtotal</p>
            <p className="text-lg font-bold">{currency}{result.subtotal.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-indigo-200">Descuento</p>
            <p className="text-lg font-bold">-{currency}{result.totalDiscount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-indigo-200">Impuestos ({invoice.taxPercentage}%)</p>
            <p className="text-lg font-bold">{currency}{result.totalTax.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-indigo-200">Propina ({invoice.tipPercentage}%)</p>
            <p className="text-lg font-bold">{currency}{result.totalTip.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Per Participant Breakdown Cards */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-indigo-600" />
            <span>Desglose por Persona</span>
          </h3>

          <button
            onClick={onExportPDF}
            disabled={result.shares.length === 0 || result.subtotal === 0}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-xl text-sm font-medium transition shadow-sm"
          >
            <FileDown className="w-4 h-4" />
            <span>Descargar Reporte PDF</span>
          </button>
        </div>

        {result.shares.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            Agrega participantes e ítems para ver el desglose detallado.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {result.shares.map((share) => (
              <div
                key={share.participantId}
                className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2.5">
                      <span
                        className="w-4 h-4 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: share.participantColor }}
                      />
                      <h4 className="font-bold text-gray-900 text-base">{share.participantName}</h4>
                    </div>
                    <span className="text-xl font-black text-indigo-600">
                      {currency}{share.total.toFixed(2)}
                    </span>
                  </div>

                  {/* Details breakdown */}
                  <div className="space-y-1.5 text-xs text-gray-600 border-t border-gray-200 pt-3 mb-4">
                    <div className="flex justify-between">
                      <span>Subtotal ítems:</span>
                      <span className="font-medium">{currency}{share.subtotal.toFixed(2)}</span>
                    </div>
                    {share.discountShare > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Descuento proporcional:</span>
                        <span className="font-medium">-{currency}{share.discountShare.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Impuestos ({invoice.taxPercentage}%):</span>
                      <span className="font-medium">{currency}{share.taxShare.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Propina ({invoice.tipPercentage}%):</span>
                      <span className="font-medium">{currency}{share.tipShare.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Assigned items list */}
                  <div className="border-t border-gray-200 pt-3">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Consumos asignados:</p>
                    {share.assignedItems.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">Sin ítems específicos.</p>
                    ) : (
                      <ul className="space-y-1 max-h-36 overflow-y-auto pr-1">
                        {share.assignedItems.map((item, idx) => (
                          <li key={idx} className="text-xs flex justify-between text-gray-600">
                            <span className="truncate pr-2" title={item.itemName}>
                              • {item.itemName} <span className="text-gray-400">({item.quantity % 1 === 0 ? item.quantity : item.quantity.toFixed(1)}x)</span>
                            </span>
                            <span className="font-medium shrink-0">{currency}{item.share.toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                  <span>Estado: Pendiente de pago</span>
                  <CheckCircle2 className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
