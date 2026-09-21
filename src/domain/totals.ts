import type { Invoice } from './types';

export interface InvoiceTotals {
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  totalTip: number;
  grandTotal: number;
}

/**
 * Totales globales de la factura, respetando los flags de habilitación
 * (taxEnabled, tipEnabled, discountEnabled). Compartido por todas las
 * estrategias para mantener la aritmética consistente entre ellas.
 */
export function calculateTotals(invoice: Invoice): InvoiceTotals {
  const { items, taxPercentage, tipPercentage, discountAmount, taxEnabled, tipEnabled, discountEnabled } = invoice;

  // Subtotal from items (price * quantity)
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const totalDiscount = discountEnabled ? Math.min(Math.max(0, discountAmount), subtotal) : 0;
  const discountedSubtotal = subtotal - totalDiscount;

  const totalTax = taxEnabled ? (discountedSubtotal * Math.max(0, taxPercentage)) / 100 : 0;
  const totalTip = tipEnabled ? (discountedSubtotal * Math.max(0, tipPercentage)) / 100 : 0;
  const grandTotal = discountedSubtotal + totalTax + totalTip;

  return { subtotal, totalDiscount, totalTax, totalTip, grandTotal };
}
