import React, { useState } from 'react';
import type { InvoiceItem, Participant, SplitMode } from '../domain/types';
import { ShoppingBag, Plus, Trash2, Check, Tag } from 'lucide-react';

interface ItemsManagerProps {
  items: InvoiceItem[];
  participants: Participant[];
  splitMode: SplitMode;
  currency: string;
  onAddItem: (name: string, price: number, quantity: number, assignedParticipantIds: string[]) => void;
  onRemoveItem: (id: string) => void;
  onToggleAssignment: (itemId: string, participantId: string) => void;
}

export const ItemsManager: React.FC<ItemsManagerProps> = ({
  items,
  participants,
  splitMode,
  currency,
  onAddItem,
  onRemoveItem,
  onToggleAssignment,
}) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  // Selected participant IDs when creating a new item (defaults to all participants)
  const [selectedParticipantsForNew, setSelectedParticipantsForNew] = useState<string[]>([]);

  // Synchronize default selected participants when participants list changes
  React.useEffect(() => {
    setSelectedParticipantsForNew(participants.map((p) => p.id));
  }, [participants]);

  const toggleNewParticipant = (pId: string) => {
    setSelectedParticipantsForNew((prev) =>
      prev.includes(pId) ? prev.filter((id) => id !== pId) : [...prev, pId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pVal = parseFloat(price);
    const qVal = parseFloat(quantity);
    if (name.trim() && !isNaN(pVal) && pVal >= 0 && !isNaN(qVal) && qVal > 0) {
      // In itemized mode, pass the selected participants. If empty, pass empty array (fallback to all)
      const assigned = splitMode === 'itemized' ? selectedParticipantsForNew : [];
      onAddItem(name, pVal, qVal, assigned);
      setName('');
      setPrice('');
      setQuantity('1');
      setSelectedParticipantsForNew(participants.map((p) => p.id));
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
          <ShoppingBag className="w-5 h-5 text-indigo-600" />
          <span>Ítems / Consumos ({items.length})</span>
        </h2>
        {splitMode === 'itemized' && (
          <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-medium">
            Modo Ítem por Ítem activo: Selecciona quiénes participan en cada ítem
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6">
            <label className="block text-xs font-medium text-gray-700 mb-1">Nombre del ítem</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Pizza familiar, Botella de vino..."
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
            />
          </div>
          <div className="sm:col-span-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">Precio unitario</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 text-sm">
                {currency}
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
              />
            </div>
          </div>
          <div className="sm:col-span-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">Cantidad</label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
            />
          </div>
        </div>

        {splitMode === 'itemized' && participants.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Personas involucradas en este ítem (por defecto todas):
            </label>
            <div className="flex flex-wrap gap-2">
              {participants.map((p) => {
                const isSelected = selectedParticipantsForNew.includes(p.id);
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => toggleNewParticipant(p.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: isSelected ? '#fff' : p.color }}
                    />
                    <span>{p.name}</span>
                    {isSelected && <Check className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full flex items-center justify-center space-x-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Ítem</span>
        </button>
      </form>

      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          No hay ítems registrados. Añade los platos, bebidas o servicios consumidos.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const itemTotal = item.price * item.quantity;
            return (
              <div
                key={item.id}
                className="flex flex-col md:flex-row md:items-center justify-between bg-gray-50 border border-gray-200 p-4 rounded-xl gap-3"
              >
                <div className="flex items-start md:items-center space-x-3">
                  <div className="bg-indigo-100 text-indigo-700 p-2 rounded-lg mt-0.5 md:mt-0">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">{item.name}</h3>
                    <p className="text-xs text-gray-500">
                      {item.quantity} x {currency}{item.price.toFixed(2)} ={' '}
                      <strong className="text-gray-800">
                        {currency}{itemTotal.toFixed(2)}
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {splitMode === 'itemized' && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs text-gray-500 mr-1">Involucrados:</span>
                      {participants.length === 0 ? (
                        <span className="text-xs text-red-500 italic">Agrega participantes primero</span>
                      ) : (
                        participants.map((p) => {
                          const isExplicitlyAssigned = item.assignedParticipantIds.includes(p.id);

                          return (
                            <button
                              key={p.id}
                              onClick={() => onToggleAssignment(item.id, p.id)}
                              title={
                                item.assignedParticipantIds.length === 0
                                  ? 'Actualmente se reparte entre todos. Clic para asignar específicamente.'
                                  : ''
                              }
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center space-x-1 ${
                                isExplicitlyAssigned || (item.assignedParticipantIds.length === 0)
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-white border border-gray-300 text-gray-400 hover:bg-gray-100 hover:text-gray-700'
                              }`}
                            >
                              <span>{p.name}</span>
                              {(isExplicitlyAssigned || item.assignedParticipantIds.length === 0) && (
                                <Check className="w-3 h-3" />
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-gray-400 hover:text-red-600 transition self-end sm:self-center p-1.5 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
