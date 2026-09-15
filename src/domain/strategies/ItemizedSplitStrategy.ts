import type { ISplitStrategy } from './ISplitStrategy';
import type { Invoice, CalculationResult, ParticipantShare } from '../types';

export class ItemizedSplitStrategy implements ISplitStrategy {
  calculate(invoice: Invoice): CalculationResult {
    const { participants, items, taxPercentage, tipPercentage, discountAmount } = invoice;

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

    // Initialize map for each participant's subtotal and assigned items
    const participantData: Record<
      string,
      { subtotal: number; assignedItems: { itemName: string; price: number; quantity: number; share: number }[] }
    > = {};

    participants.forEach((p) => {
      participantData[p.id] = { subtotal: 0, assignedItems: [] };
    });

    // Calculate item shares
    items.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      const assigned = item.assignedParticipantIds;

      if (assigned.length === 0) {
        // Fallback: split among all participants if nobody is assigned
        const sharePerPerson = itemTotal / participants.length;
        const qtyPerPerson = item.quantity / participants.length;
        participants.forEach((p) => {
          participantData[p.id].subtotal += sharePerPerson;
          participantData[p.id].assignedItems.push({
            itemName: item.name,
            price: item.price,
            quantity: qtyPerPerson,
            share: sharePerPerson,
          });
        });
      } else {
        // Split among assigned participants
        const sharePerPerson = itemTotal / assigned.length;
        const qtyPerPerson = item.quantity / assigned.length;
        assigned.forEach((pId) => {
          if (participantData[pId]) {
            participantData[pId].subtotal += sharePerPerson;
            participantData[pId].assignedItems.push({
              itemName: item.name,
              price: item.price,
              quantity: qtyPerPerson,
              share: sharePerPerson,
            });
          }
        });
      }
    });

    // Calculate tax, tip, and discount proportions based on subtotals
    const calculatedSubtotalSum = Object.values(participantData).reduce((acc, p) => acc + p.subtotal, 0);

    const shares: ParticipantShare[] = participants.map((p) => {
      const pSubtotal = participantData[p.id]?.subtotal || 0;
      const ratio = calculatedSubtotalSum > 0 ? pSubtotal / calculatedSubtotalSum : 1 / participants.length;

      const pTax = totalTax * ratio;
      const pTip = totalTip * ratio;
      const pDiscount = totalDiscount * ratio;
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
        assignedItems: participantData[p.id]?.assignedItems || [],
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
