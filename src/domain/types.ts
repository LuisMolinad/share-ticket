export interface Participant {
  id: string;
  name: string;
  color: string;
}

export interface InvoiceItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  assignedParticipantIds: string[]; // For itemized split
}

export type SplitMode = 'equal' | 'itemized';

export interface Invoice {
  title: string;
  date: string;
  currency: string;
  taxPercentage: number;
  tipPercentage: number;
  discountAmount: number;
  splitMode: SplitMode;
  participants: Participant[];
  items: InvoiceItem[];
}

export interface ParticipantShare {
  participantId: string;
  participantName: string;
  participantColor: string;
  subtotal: number;
  taxShare: number;
  tipShare: number;
  discountShare: number;
  total: number;
  assignedItems: { itemName: string; price: number; quantity: number; share: number }[];
}

export interface CalculationResult {
  subtotal: number;
  totalTax: number;
  totalTip: number;
  totalDiscount: number;
  grandTotal: number;
  shares: ParticipantShare[];
}
