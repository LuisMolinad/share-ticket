import type { SubInvoice } from '../domain/types';

export interface InvoiceTotals {
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  totalTip: number;
  grandTotal: number;
}

/**
 * Totales para un sub-ticket específico, respetando los flags de habilitación
 * (taxEnabled, tipEnabled, discountEnabled).
 */
export function calculateSubInvoiceTotals(subInvoice: SubInvoice): InvoiceTotals {
  const { items, taxPercentage, tipPercentage, discountAmount, taxEnabled, tipEnabled, discountEnabled } = subInvoice;

  // Subtotal from items (price * quantity)
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const totalDiscount = discountEnabled ? Math.min(Math.max(0, discountAmount), subtotal) : 0;
  const discountedSubtotal = subtotal - totalDiscount;

  const totalTax = taxEnabled ? (discountedSubtotal * Math.max(0, taxPercentage)) / 100 : 0;
  const totalTip = tipEnabled ? (discountedSubtotal * Math.max(0, tipPercentage)) / 100 : 0;
  const grandTotal = discountedSubtotal + totalTax + totalTip;

  return { subtotal, totalDiscount, totalTax, totalTip, grandTotal };
}
