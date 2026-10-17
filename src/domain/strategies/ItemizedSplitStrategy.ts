import type { ISplitStrategy } from './ISplitStrategy';
import type { Invoice, CalculationResult, ParticipantShare } from '../types';
import { calculateSubInvoiceTotals } from '../totals';

export class ItemizedSplitStrategy implements ISplitStrategy {
  calculate(invoice: Invoice): CalculationResult {
    const { participants, subInvoices } = invoice;

    let totalSubtotal = 0;
    let totalTaxAll = 0;
    let totalTipAll = 0;
    let totalDiscountAll = 0;
    let grandTotalAll = 0;

    const participantMap: Record<
      string,
      {
        subtotal: number;
        taxShare: number;
        tipShare: number;
        discountShare: number;
        total: number;
        assignedItems: { itemName: string; price: number; quantity: number; share: number }[];
        ticketBreakdowns: {
          subInvoiceId: string;
          subInvoiceTitle: string;
          subtotal: number;
          taxShare: number;
          tipShare: number;
          discountShare: number;
          total: number;
          assignedItems: { itemName: string; price: number; quantity: number; share: number }[];
        }[];
      }
    > = {};

    participants.forEach((p) => {
      participantMap[p.id] = {
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

      const subParticipantData: Record<
        string,
        { subtotal: number; assignedItems: { itemName: string; price: number; quantity: number; share: number }[] }
      > = {};

      participants.forEach((p) => {
        subParticipantData[p.id] = { subtotal: 0, assignedItems: [] };
      });

      sub.items.forEach((item) => {
        const itemTotal = item.price * item.quantity;
        const assigned = item.assignedParticipantIds;

        if (assigned.length === 0) {
          const sharePerPerson = itemTotal / participants.length;
          const qtyPerPerson = item.quantity / participants.length;
          participants.forEach((p) => {
            subParticipantData[p.id].subtotal += sharePerPerson;
            subParticipantData[p.id].assignedItems.push({
              itemName: `[${sub.title}] ${item.name}`,
              price: item.price,
              quantity: qtyPerPerson,
              share: sharePerPerson,
            });
          });
        } else {
          const sharePerPerson = itemTotal / assigned.length;
          const qtyPerPerson = item.quantity / assigned.length;
          assigned.forEach((pId) => {
            if (subParticipantData[pId]) {
              subParticipantData[pId].subtotal += sharePerPerson;
              subParticipantData[pId].assignedItems.push({
                itemName: `[${sub.title}] ${item.name}`,
                price: item.price,
                quantity: qtyPerPerson,
                share: sharePerPerson,
              });
            }
          });
        }
      });

      const calculatedSubtotalSum = Object.values(subParticipantData).reduce((acc, p) => acc + p.subtotal, 0);

      participants.forEach((p) => {
        const pSub = subParticipantData[p.id]?.subtotal || 0;
        const ratio = calculatedSubtotalSum > 0 ? pSub / calculatedSubtotalSum : 1 / participants.length;

        const pTax = totalTax * ratio;
        const pTip = totalTip * ratio;
        const pDisc = totalDiscount * ratio;
        const pTotal = Math.max(0, pSub - pDisc + pTax + pTip);
        const assignedList = subParticipantData[p.id]?.assignedItems || [];

        participantMap[p.id].subtotal += pSub;
        participantMap[p.id].taxShare += pTax;
        participantMap[p.id].tipShare += pTip;
        participantMap[p.id].discountShare += pDisc;
        participantMap[p.id].total += pTotal;
        participantMap[p.id].assignedItems.push(...assignedList);

        participantMap[p.id].ticketBreakdowns.push({
          subInvoiceId: sub.id,
          subInvoiceTitle: sub.title,
          subtotal: pSub,
          taxShare: pTax,
          tipShare: pTip,
          discountShare: pDisc,
          total: pTotal,
          assignedItems: assignedList,
        });
      });
    });

    const shares: ParticipantShare[] = participants.map((p) => {
      const data = participantMap[p.id];
      return {
        participantId: p.id,
        participantName: p.name,
        participantColor: p.color,
        subtotal: data.subtotal,
        taxShare: data.taxShare,
        tipShare: data.tipShare,
        discountShare: data.discountShare,
        total: data.total,
        assignedItems: data.assignedItems,
        ticketBreakdowns: data.ticketBreakdowns,
      };
    });

    return {
      subtotal: totalSubtotal,
      totalTax: totalTaxAll,
      totalTip: totalTipAll,
      totalDiscount: totalDiscountAll,
      grandTotal: grandTotalAll,
      shares,
    };
  }
}
