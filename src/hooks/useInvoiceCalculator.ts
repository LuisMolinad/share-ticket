import { useState, useMemo, useCallback } from 'react';
import type { Invoice, CalculationResult, InvoiceItem } from '../domain/types';
import { SplitStrategyFactory } from '../domain/factories/SplitStrategyFactory';

const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
];

export function useInvoiceCalculator() {
  const [invoice, setInvoice] = useState<Invoice>({
    title: 'Cena de Amigos',
    date: new Date().toISOString().split('T')[0],
    currency: '$',
    taxPercentage: 10,
    tipPercentage: 15,
    discountAmount: 0,
    splitMode: 'equal',
    participants: [
      { id: '1', name: 'Ana', color: DEFAULT_COLORS[0] },
      { id: '2', name: 'Carlos', color: DEFAULT_COLORS[1] },
      { id: '3', name: 'Sofía', color: DEFAULT_COLORS[2] },
    ],
    items: [
      { id: '101', name: 'Entrada compartida', price: 25.0, quantity: 1, assignedParticipantIds: [] },
      { id: '102', name: 'Plato Principal', price: 45.0, quantity: 2, assignedParticipantIds: [] },
      { id: '103', name: 'Bebidas', price: 15.0, quantity: 3, assignedParticipantIds: [] },
    ],
  });

  // Calculate results using Strategy Pattern
  const calculationResult: CalculationResult = useMemo(() => {
    const strategy = SplitStrategyFactory.createStrategy(invoice.splitMode);
    return strategy.calculate(invoice);
  }, [invoice]);

  const updateInvoiceDetails = useCallback((updates: Partial<Invoice>) => {
    setInvoice((prev) => ({ ...prev, ...updates }));
  }, []);

  const addParticipant = useCallback((name: string) => {
    if (!name.trim()) return;
    setInvoice((prev) => {
      const newId = Date.now().toString();
      const color = DEFAULT_COLORS[prev.participants.length % DEFAULT_COLORS.length];
      return {
        ...prev,
        participants: [...prev.participants, { id: newId, name: name.trim(), color }],
      };
    });
  }, []);

  const removeParticipant = useCallback((id: string) => {
    setInvoice((prev) => ({
      ...prev,
      participants: prev.participants.filter((p) => p.id !== id),
      items: prev.items.map((item) => ({
        ...item,
        assignedParticipantIds: item.assignedParticipantIds.filter((pId) => pId !== id),
      })),
    }));
  }, []);

  const updateParticipant = useCallback((id: string, name: string) => {
    setInvoice((prev) => ({
      ...prev,
      participants: prev.participants.map((p) => (p.id === id ? { ...p, name: name.trim() } : p)),
    }));
  }, []);

  const addItem = useCallback((name: string, price: number, quantity: number, assignedParticipantIds: string[] = []) => {
    if (!name.trim() || price < 0 || quantity <= 0) return;
    setInvoice((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Date.now().toString(),
          name: name.trim(),
          price,
          quantity,
          assignedParticipantIds,
        },
      ],
    }));
  }, []);

  const removeItem = useCallback((id: string) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<InvoiceItem>) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    }));
  }, []);

  const toggleItemAssignment = useCallback((itemId: string, participantId: string) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id !== itemId) return item;
        const exists = item.assignedParticipantIds.includes(participantId);
        const assignedParticipantIds = exists
          ? item.assignedParticipantIds.filter((id) => id !== participantId)
          : [...item.assignedParticipantIds, participantId];
        return { ...item, assignedParticipantIds };
      }),
    }));
  }, []);

  const resetInvoice = useCallback(() => {
    setInvoice({
      title: 'Nueva Factura',
      date: new Date().toISOString().split('T')[0],
      currency: '$',
      taxPercentage: 0,
      tipPercentage: 0,
      discountAmount: 0,
      splitMode: 'equal',
      participants: [],
      items: [],
    });
  }, []);

  return {
    invoice,
    calculationResult,
    updateInvoiceDetails,
    addParticipant,
    removeParticipant,
    updateParticipant,
    addItem,
    removeItem,
    updateItem,
    toggleItemAssignment,
    resetInvoice,
  };
}
