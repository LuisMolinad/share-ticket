import type { ISplitStrategy } from './ISplitStrategy';
import type { Invoice, CalculationResult, ParticipantShare } from '../types';
import { calculateSubInvoiceTotals } from '../totals';

export class EqualSplitStrategy implements ISplitStrategy {
  calculate(invoice: Invoice): CalculationResult {
    const { participants, subInvoices } = invoice;

    let totalSubtotal = 0;
    let totalTaxAll = 0;
    let totalTipAll = 0;
    let totalDiscountAll = 0;
    let grandTotalAll = 0;

    const participantMap: Record<string, ParticipantShare> = {};

    participants.forEach((p) => {
      participantMap[p.id] = {
        participantId: p.id,
        participantName: p.name,
        participantColor: p.color,
        subtotal: 0,
        taxShare: 0,
        tipShare: 0,
        discountShare: 0,
        total: 0,
        assignedItems: [],
        ticketBreakdowns: [],
      };
    });

    subInvoices.forEach((sub) => {
      const { subtotal, totalDiscount, totalTax, totalTip, grandTotal } = calculateSubInvoiceTotals(sub);

      totalSubtotal += subtotal;
      totalDiscountAll += totalDiscount;
      totalTaxAll += totalTax;
      totalTipAll += totalTip;
      grandTotalAll += grandTotal;

      if (participants.length === 0) return;

      const sharePerPerson = subtotal / participants.length;
      const taxPerPerson = totalTax / participants.length;
      const tipPerPerson = totalTip / participants.length;
      const discountPerPerson = totalDiscount / participants.length;

      participants.forEach((p) => {
        const pSub = sharePerPerson;
        const pTax = taxPerPerson;
        const pTip = tipPerPerson;
        const pDisc = discountPerPerson;
        const pTotal = Math.max(0, pSub - pDisc + pTax + pTip);

        const assignedItemsForSub = sub.items.map((item) => ({
          itemName: `[${sub.title}] ${item.name}`,
          price: item.price,
          quantity: item.quantity / participants.length,
          share: (item.price * item.quantity) / participants.length,
        }));

        participantMap[p.id].subtotal += pSub;
        participantMap[p.id].taxShare += pTax;
        participantMap[p.id].tipShare += pTip;
        participantMap[p.id].discountShare += pDisc;
        participantMap[p.id].total += pTotal;
        participantMap[p.id].assignedItems.push(...assignedItemsForSub);

        participantMap[p.id].ticketBreakdowns.push({
          subInvoiceId: sub.id,
          subInvoiceTitle: sub.title,
          subtotal: pSub,
          taxShare: pTax,
          tipShare: pTip,
          discountShare: pDisc,
          total: pTotal,
          assignedItems: assignedItemsForSub,
        });
      });
    });

    return {
      subtotal: totalSubtotal,
      totalTax: totalTaxAll,
      totalTip: totalTipAll,
      totalDiscount: totalDiscountAll,
      grandTotal: grandTotalAll,
      shares: Object.values(participantMap),
    };
  }
}
