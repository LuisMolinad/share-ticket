import React, { useState } from 'react';
import type { InvoiceItem, Participant, SplitMode } from '../domain/types';
import { ShoppingBag, Plus, Trash2, Check, Tag } from 'lucide-react';
import './ItemsManager.css';

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
  const [selectedParticipantsForNew, setSelectedParticipantsForNew] = useState<string[]>([]);

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
      const assigned = splitMode === 'itemized' ? selectedParticipantsForNew : [];
      onAddItem(name, pVal, qVal, assigned);
      setName('');
      setPrice('');
      setQuantity('1');
      setSelectedParticipantsForNew(participants.map((p) => p.id));
    }
  };

  return (
    <div className="card">
      <div className="items-header-row">
        <h2 className="card-title margin-zero">
          <ShoppingBag />
          <span>Ítems / Consumos ({items.length})</span>
        </h2>
        {splitMode === 'itemized' && (
          <span className="items-mode-badge">
            Modo Ítem por Ítem activo
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="items-form-box">
        <div className="items-grid-12">
          <div className="col-span-12 sm-col-6">
            <label className="form-label">Nombre del ítem</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Pizza familiar..."
              className="form-input"
            />
          </div>
          <div className="col-span-12 sm-col-3">
            <label className="form-label">Precio unitario</label>
            <div className="input-with-icon">
              <span className="input-icon currency-icon-span">{currency}</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="form-input items-price-input"
              />
            </div>
          </div>
          <div className="col-span-12 sm-col-3">
            <label className="form-label">Cantidad</label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="1"
              className="form-input"
            />
          </div>
        </div>

        {splitMode === 'itemized' && participants.length > 0 && (
          <div>
            <label className="form-label items-label-block">
              Personas involucradas en este ítem:
            </label>
            <div className="participants-list">
              {participants.map((p) => {
                const isSelected = selectedParticipantsForNew.includes(p.id);
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => toggleNewParticipant(p.id)}
                    className={`assignment-btn ${isSelected ? 'assigned' : ''}`}
                  >
                    <span className="participant-dot" style={{ backgroundColor: isSelected ? '#fff' : p.color, width: '0.5rem', height: '0.5rem' }} />
                    <span>{p.name}</span>
                    {isSelected && <Check size={12} />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-full">
          <Plus size={16} />
          <span>Agregar Ítem</span>
        </button>
      </form>

      {items.length === 0 ? (
        <div className="empty-state">
          No hay ítems registrados. Añade los platos, bebidas o servicios consumidos.
        </div>
      ) : (
        <div className="items-list-container">
          {items.map((item) => {
            const itemTotal = item.price * item.quantity;
            return (
              <div key={item.id} className="item-card">
                <div className="item-info">
                  <div className="item-icon-box">
                    <Tag size={16} />
                  </div>
                  <div>
                    <h3 className="item-name">{item.name}</h3>
                    <p className="item-details">
                      {item.quantity} x {currency}{item.price.toFixed(2)} ={' '}
                      <strong className="item-total-strong">
                        {currency}{itemTotal.toFixed(2)}
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="item-actions-col">
                  {splitMode === 'itemized' && (
                    <div className="item-assignments">
                      <span className="assignment-label">Involucrados:</span>
                      {participants.length === 0 ? (
                        <span className="assignment-missing">Agrega participantes</span>
                      ) : (
                        participants.map((p) => {
                          const isExplicitlyAssigned = item.assignedParticipantIds.includes(p.id);
                          const isDefaultAll = item.assignedParticipantIds.length === 0;

                          return (
                            <button
                              key={p.id}
                              onClick={() => onToggleAssignment(item.id, p.id)}
                              className={`assignment-btn ${isExplicitlyAssigned || isDefaultAll ? 'assigned' : ''}`}
                            >
                              <span>{p.name}</span>
                              {(isExplicitlyAssigned || isDefaultAll) && <Check size={12} />}
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="btn-danger-light"
                    title="Eliminar ítem"
                  >
                    <Trash2 size={16} />
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
