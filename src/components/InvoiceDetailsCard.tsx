import React from 'react';
import type { Invoice } from '../domain/types';
import { Calendar, FileText } from 'lucide-react';

interface InvoiceDetailsCardProps {
  invoice: Invoice;
  onUpdate: (updates: Partial<Invoice>) => void;
}

export const InvoiceDetailsCard: React.FC<InvoiceDetailsCardProps> = ({ invoice, onUpdate }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
        <FileText className="w-5 h-5 text-indigo-600" />
        <span>Detalles de la Factura</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Title */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Concepto / Evento</label>
          <input
            type="text"
            value={invoice.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Ej. Cena de Cumpleaños"
            className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Fecha</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Calendar className="w-4 h-4" />
            </span>
            <input
              type="date"
              value={invoice.date}
              onChange={(e) => onUpdate({ date: e.target.value })}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Currency */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Moneda</label>
          <select
            value={invoice.currency}
            onChange={(e) => onUpdate({ currency: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
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

        {/* Tax % */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Impuestos (%)</label>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="0.1"
              value={invoice.taxPercentage}
              onChange={(e) => onUpdate({ taxPercentage: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Tip % */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Propina (%)</label>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="0.1"
              value={invoice.tipPercentage}
              onChange={(e) => onUpdate({ tipPercentage: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Discount Amount */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Descuento Total ({invoice.currency})</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={invoice.discountAmount}
            onChange={(e) => onUpdate({ discountAmount: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>
      </div>
    </div>
  );
};
