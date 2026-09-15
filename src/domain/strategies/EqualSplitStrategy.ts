import type { ISplitStrategy } from './ISplitStrategy';
import type { Invoice, CalculationResult, ParticipantShare } from '../types';

export class EqualSplitStrategy implements ISplitStrategy {
  calculate(invoice: Invoice): CalculationResult {
    const { participants, items, taxPercentage, tipPercentage, discountAmount } = invoice;

    // Subtotal from items (price * quantity)
    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const totalDiscount = Math.min(Math.max(0, discountAmount), subtotal);
    const discountedSubtotal = subtotal - totalDiscount;

    const totalTax = (discountedSubtotal * Math.max(0, taxPercentage)) / 100;
    const totalTip = (discountedSubtotal * Math.max(0, tipPercentage)) / 100;
    const grandTotal = discountedSubtotal + totalTax + totalTip;

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
