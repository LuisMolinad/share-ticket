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

export interface SubInvoice {
  id: string;
  title: string;
  date: string;
  taxPercentage: number;
  tipPercentage: number;
  discountAmount: number;
  taxEnabled: boolean;
  tipEnabled: boolean;
  discountEnabled: boolean;
  splitMode: SplitMode;
  items: InvoiceItem[];
}

export interface Invoice {
  title: string; // Group / Session title (e.g. "Viaje a la Montaña" or "Salida con Amigos")
  date: string;
  currency: string;
  participants: Participant[];
  subInvoices: SubInvoice[];
}

export interface TicketShareBreakdown {
  subInvoiceId: string;
  subInvoiceTitle: string;
  subtotal: number;
  taxShare: number;
  tipShare: number;
  discountShare: number;
  total: number;
  assignedItems: { itemName: string; price: number; quantity: number; share: number }[];
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
  ticketBreakdowns: TicketShareBreakdown[];
}

export interface CalculationResult {
  subtotal: number;
  totalTax: number;
  totalTip: number;
  totalDiscount: number;
  grandTotal: number;
  shares: ParticipantShare[];
}
