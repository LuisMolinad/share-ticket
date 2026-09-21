import type { ISplitStrategy } from './ISplitStrategy';
import type { Invoice, CalculationResult, ParticipantShare } from '../types';
import { calculateTotals } from '../totals';

export class EqualSplitStrategy implements ISplitStrategy {
  calculate(invoice: Invoice): CalculationResult {
    const { participants, items } = invoice;

    // Totales globales compartidos (respeta taxEnabled / tipEnabled / discountEnabled)
    const { subtotal, totalDiscount, totalTax, totalTip, grandTotal } = calculateTotals(invoice);

    if (participants.length === 0) {
      return {
        subtotal,
        totalTax,
        totalTip,
        totalDiscount,
        grandTotal,
        shares: [],
      };
    }

    const sharePerPerson = subtotal / participants.length;
    const taxPerPerson = totalTax / participants.length;
    const tipPerPerson = totalTip / participants.length;
    const discountPerPerson = totalDiscount / participants.length;

    const shares: ParticipantShare[] = participants.map((p) => {
      const pSubtotal = sharePerPerson;
      const pTax = taxPerPerson;
      const pTip = tipPerPerson;
      const pDiscount = discountPerPerson;
      const pTotal = pSubtotal - pDiscount + pTax + pTip;

      return {
        participantId: p.id,
        participantName: p.name,
        participantColor: p.color,
        subtotal: pSubtotal,
        taxShare: pTax,
        tipShare: pTip,
        discountShare: pDiscount,
        total: Math.max(0, pTotal),
        assignedItems: items.map((item) => ({
          itemName: item.name,
          price: item.price,
          quantity: item.quantity / participants.length,
          share: (item.price * item.quantity) / participants.length,
        })),
      };
    });

    return {
      subtotal,
      totalTax,
      totalTip,
      totalDiscount,
      grandTotal,
      shares,
    };
  }
}
