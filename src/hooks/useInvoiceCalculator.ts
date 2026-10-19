import { useState, useMemo, useCallback, useEffect } from 'react';
import type { Invoice, CalculationResult, InvoiceItem, SubInvoice, ParticipantShare } from '../domain/types';
import { SplitStrategyFactory } from '../domain/factories/SplitStrategyFactory';
import { loadInvoiceFromStorage, saveInvoiceToStorage } from '../utils/jsonPersistence';

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
  const [invoice, setInvoice] = useState<Invoice>(() => {
    const loaded = loadInvoiceFromStorage();
    if (loaded) return loaded;
    return {
      title: 'Viaje y Gastos Grupales',
      date: new Date().toISOString().split('T')[0],
      currency: '$',
      participants: [
        { id: '1', name: 'Ana', color: DEFAULT_COLORS[0] },
        { id: '2', name: 'Carlos', color: DEFAULT_COLORS[1] },
        { id: '3', name: 'Sofía', color: DEFAULT_COLORS[2] },
      ],
      subInvoices: [
        {
          id: 'sub_1',
          title: 'Almuerzo Principal',
          date: new Date().toISOString().split('T')[0],
          taxPercentage: 10,
          tipPercentage: 15,
          discountAmount: 0,
          taxEnabled: true,
          tipEnabled: true,
          discountEnabled: true,
          splitMode: 'equal',
          items: [
            { id: '101', name: 'Entrada compartida', price: 25.0, quantity: 1, assignedParticipantIds: [] },
            { id: '102', name: 'Plato Principal', price: 45.0, quantity: 2, assignedParticipantIds: [] },
            { id: '103', name: 'Bebidas', price: 15.0, quantity: 3, assignedParticipantIds: [] },
          ],
        },
      ],
    };
  });

  const [activeSubInvoiceId, setActiveSubInvoiceId] = useState<string>(() => {
    if (invoice.subInvoices && invoice.subInvoices.length > 0) {
      return invoice.subInvoices[0].id;
    }
    return 'sub_1';
  });

  // Save to localStorage whenever invoice changes
  useEffect(() => {
    saveInvoiceToStorage(invoice);
  }, [invoice]);

  // Active subinvoice helper
  const activeSubInvoice = useMemo(() => {
    return invoice.subInvoices.find((s) => s.id === activeSubInvoiceId) || invoice.subInvoices[0];
  }, [invoice.subInvoices, activeSubInvoiceId]);

  // Calculate results using Strategy Pattern per subInvoice (respecting each subInvoice's splitMode)
  const calculationResult: CalculationResult = useMemo(() => {
    let totalSubtotal = 0;
    let totalTaxAll = 0;
    let totalTipAll = 0;
    let totalDiscountAll = 0;
    let grandTotalAll = 0;

    const participantMap: Record<string, ParticipantShare> = {};

    invoice.participants.forEach((p) => {
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

    invoice.subInvoices.forEach((sub) => {
      const strategy = SplitStrategyFactory.createStrategy(sub.splitMode);
      const subResult = strategy.calculate({
        ...invoice,
        subInvoices: [sub],
      });

      totalSubtotal += subResult.subtotal;
      totalTaxAll += subResult.totalTax;
      totalTipAll += subResult.totalTip;
      totalDiscountAll += subResult.totalDiscount;
      grandTotalAll += subResult.grandTotal;

      subResult.shares.forEach((share) => {
        if (participantMap[share.participantId]) {
          participantMap[share.participantId].subtotal += share.subtotal;
          participantMap[share.participantId].taxShare += share.taxShare;
          participantMap[share.participantId].tipShare += share.tipShare;
          participantMap[share.participantId].discountShare += share.discountShare;
          participantMap[share.participantId].total += share.total;
          participantMap[share.participantId].assignedItems.push(...share.assignedItems);
          participantMap[share.participantId].ticketBreakdowns.push(...share.ticketBreakdowns);
        }
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
  }, [invoice]);

  const updateInvoiceDetails = useCallback((updates: Partial<Invoice>) => {
    setInvoice((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateActiveSubInvoiceDetails = useCallback((updates: Partial<SubInvoice>) => {
    setInvoice((prev) => ({
      ...prev,
      subInvoices: prev.subInvoices.map((sub) => (sub.id === activeSubInvoiceId ? { ...sub, ...updates } : sub)),
    }));
  }, [activeSubInvoiceId]);

  const addSubInvoice = useCallback((title: string = 'Nuevo Ticket') => {
    setInvoice((prev) => {
      const newId = `sub_${Date.now()}`;
      const newSub: SubInvoice = {
        id: newId,
        title: title.trim() || 'Nuevo Ticket',
        date: new Date().toISOString().split('T')[0],
        taxPercentage: 10,
        tipPercentage: 15,
        discountAmount: 0,
        taxEnabled: true,
        tipEnabled: true,
        discountEnabled: true,
        splitMode: 'equal',
        items: [],
      };
      setActiveSubInvoiceId(newId);
      return {
        ...prev,
        subInvoices: [...prev.subInvoices, newSub],
      };
    });
  }, []);

  const removeSubInvoice = useCallback((id: string) => {
    setInvoice((prev) => {
      if (prev.subInvoices.length <= 1) return prev; // Keep at least one ticket
      const remaining = prev.subInvoices.filter((s) => s.id !== id);
      if (activeSubInvoiceId === id) {
        setActiveSubInvoiceId(remaining[0].id);
      }
      return {
        ...prev,
        subInvoices: remaining,
      };
    });
  }, [activeSubInvoiceId]);

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
      subInvoices: prev.subInvoices.map((sub) => ({
        ...sub,
        items: sub.items.map((item) => ({
          ...item,
          assignedParticipantIds: item.assignedParticipantIds.filter((pId) => pId !== id),
        })),
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
      subInvoices: prev.subInvoices.map((sub) => {
        if (sub.id !== activeSubInvoiceId) return sub;
        return {
          ...sub,
          items: [
            ...sub.items,
            {
              id: Date.now().toString(),
              name: name.trim(),
              price,
              quantity,
              assignedParticipantIds,
            },
          ],
        };
      }),
    }));
  }, [activeSubInvoiceId]);

  const removeItem = useCallback((id: string) => {
    setInvoice((prev) => ({
      ...prev,
      subInvoices: prev.subInvoices.map((sub) => {
        if (sub.id !== activeSubInvoiceId) return sub;
        return {
          ...sub,
          items: sub.items.filter((item) => item.id !== id),
        };
      }),
    }));
  }, [activeSubInvoiceId]);

  const updateItem = useCallback((id: string, updates: Partial<InvoiceItem>) => {
    setInvoice((prev) => ({
      ...prev,
      subInvoices: prev.subInvoices.map((sub) => {
        if (sub.id !== activeSubInvoiceId) return sub;
        return {
          ...sub,
          items: sub.items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
        };
      }),
    }));
  }, [activeSubInvoiceId]);

  const toggleItemAssignment = useCallback((itemId: string, participantId: string) => {
    setInvoice((prev) => ({
      ...prev,
      subInvoices: prev.subInvoices.map((sub) => {
        if (sub.id !== activeSubInvoiceId) return sub;
        return {
          ...sub,
          items: sub.items.map((item) => {
            if (item.id !== itemId) return item;
            const exists = item.assignedParticipantIds.includes(participantId);
            const assignedParticipantIds = exists
              ? item.assignedParticipantIds.filter((id) => id !== participantId)
              : [...item.assignedParticipantIds, participantId];
            return { ...item, assignedParticipantIds };
          }),
        };
      }),
    }));
  }, [activeSubInvoiceId]);

  const resetInvoice = useCallback(() => {
    setInvoice({
      title: 'Nuevo Viaje / Grupo',
      date: new Date().toISOString().split('T')[0],
      currency: '$',
      participants: [],
      subInvoices: [
        {
          id: 'sub_1',
          title: 'Ticket Principal',
          date: new Date().toISOString().split('T')[0],
          taxPercentage: 0,
          tipPercentage: 0,
          discountAmount: 0,
          taxEnabled: true,
          tipEnabled: true,
          discountEnabled: true,
          splitMode: 'equal',
          items: [],
        },
      ],
    });
    setActiveSubInvoiceId('sub_1');
  }, []);

  const importInvoice = useCallback((newInvoice: Invoice) => {
    setInvoice(newInvoice);
    if (newInvoice.subInvoices && newInvoice.subInvoices.length > 0) {
      setActiveSubInvoiceId(newInvoice.subInvoices[0].id);
    }
  }, []);

  return {
    invoice,
    activeSubInvoice,
    activeSubInvoiceId,
    setActiveSubInvoiceId,
    calculationResult,
    updateInvoiceDetails,
    updateActiveSubInvoiceDetails,
    addSubInvoice,
    removeSubInvoice,
    addParticipant,
    removeParticipant,
    updateParticipant,
    addItem,
    removeItem,
    updateItem,
    toggleItemAssignment,
    resetInvoice,
    importInvoice,
  };
}
