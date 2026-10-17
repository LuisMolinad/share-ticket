import React from 'react';
import type { SubInvoice, Participant } from '../domain/types';
import { Plus, Trash2, Check } from 'lucide-react';
import { formatAmount } from '../utils/formatters';
import './ItemsManager.css';

interface ItemsManagerProps {
  subInvoice: SubInvoice;
  participants: Participant[];
  currency: string;
  onAddItem: (name: string, price: number, quantity: number, assignedParticipantIds: string[]) => void;
  onRemoveItem: (id: string) => void;
  onToggleAssignment: (itemId: string, participantId: string) => void;
}

export const ItemsManager: React.FC<ItemsManagerProps> = ({
  subInvoice,
  participants,
  currency,
  onAddItem,
  onRemoveItem,
  onToggleAssignment,
}) => {
  const [name, setName] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [quantity, setQuantity] = React.useState('1');
  const [selectedParticipants, setSelectedParticipants] = React.useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseFloat(price);
    const q = parseFloat(quantity);
    if (!name.trim() || isNaN(p) || p < 0 || isNaN(q) || q <= 0) return;

    onAddItem(name.trim(), p, q, selectedParticipants);
    setName('');
    setPrice('');
    setQuantity('1');
    setSelectedParticipants([]);
  };

  const toggleParticipantSelection = (pId: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(pId) ? prev.filter((id) => id !== pId) : [...prev, pId]
    );
  };

  return (
    <div className="card">
      <h3 className="card-title">
        <span>Ítems / Consumos para "{subInvoice.title}"</span>
      </h3>

      <form onSubmit={handleSubmit} className="item-form">
        <div className="item-form-row">
          <input
            type="text"
            placeholder="Descripción (ej. Entradas, Cervezas)..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input item-name-input"
          />
          <div className="price-input-wrapper">
            <span className="input-prefix">{currency}</span>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Precio"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="form-input price-input"
            />
          </div>
          <input
            type="number"
            step="1"
            min="1"
            placeholder="Cant"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="form-input qty-input"
          />
          <button type="submit" className="btn btn-primary btn-add-item">
            <Plus size={16} />
            <span>Agregar</span>
          </button>
        </div>

        {subInvoice.splitMode === 'itemized' && participants.length > 0 && (
          <div className="item-assignment-selector">
            <p className="assignment-label">Asignar inicialmente a (opcional, si vacíos participan todos):</p>
            <div className="assignment-pills">
              {participants.map((p) => {
                const isSelected = selectedParticipants.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`assignment-pill ${isSelected ? 'selected' : ''}`}
                    style={{ borderColor: p.color, backgroundColor: isSelected ? p.color : 'transparent', color: isSelected ? '#fff' : '#374151' }}
                    onClick={() => toggleParticipantSelection(p.id)}
                  >
                    {isSelected && <Check size={12} />}
                    <span>{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </form>

      <div className="items-list-container">
        {subInvoice.items.length === 0 ? (
          <div className="empty-state">No hay ítems registrados en este ticket.</div>
        ) : (
          <div className="items-list">
            {subInvoice.items.map((item) => {
              const totalItemPrice = item.price * item.quantity;
              return (
                <div key={item.id} className="item-card">
                  <div className="item-info">
                    <div className="item-main-details">
                      <span className="item-name">{item.name}</span>
                      <span className="item-price">
                        {currency}{formatAmount(totalItemPrice)}
                        {item.quantity > 1 && (
                          <span className="item-unit-hint"> ({item.quantity}x {currency}{formatAmount(item.price)})</span>
                        )}
                      </span>
                    </div>

                    {subInvoice.splitMode === 'itemized' && (
                      <div className="item-participants-tags">
                        {participants.length === 0 ? (
                          <span className="no-participants-warning">Sin participantes en el grupo</span>
                        ) : (
                          participants.map((p) => {
                            const isExplicitlyAssigned = item.assignedParticipantIds.includes(p.id);
                            return (
                              <button
                                key={p.id}
                                type="button"
                                className={`participant-tag ${isExplicitlyAssigned ? 'active' : ''} ${item.assignedParticipantIds.length === 0 ? 'default-all' : ''}`}
                                style={{
                                  backgroundColor: isExplicitlyAssigned ? p.color : '#f3f4f6',
                                  color: isExplicitlyAssigned ? '#fff' : '#4b5563',
                                  borderColor: p.color,
                                }}
                                onClick={() => onToggleAssignment(item.id, p.id)}
                                title={`Alternar participación de ${p.name}`}
                              >
                                {p.name}
                              </button>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="btn-icon-danger"
                    title="Eliminar ítem"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
