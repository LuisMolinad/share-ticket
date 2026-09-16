import React, { useState } from 'react';
import type { Participant } from '../domain/types';
import { Users, UserPlus, Trash2, Edit2, Check } from 'lucide-react';
import './ParticipantsManager.css';

interface ParticipantsManagerProps {
  participants: Participant[];
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, name: string) => void;
}

export const ParticipantsManager: React.FC<ParticipantsManagerProps> = ({
  participants,
  onAdd,
  onRemove,
  onUpdate,
}) => {
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onAdd(newName);
      setNewName('');
    }
  };

  const startEditing = (p: Participant) => {
    setEditingId(p.id);
    setEditingName(p.name);
  };

  const saveEditing = (id: string) => {
    if (editingName.trim()) {
      onUpdate(id, editingName);
    }
    setEditingId(null);
  };

  return (
    <div className="card">
      <h2 className="card-title">
        <Users />
        <span>Participantes ({participants.length})</span>
      </h2>

      <form onSubmit={handleAddSubmit} className="participants-form">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nombre del participante..."
          className="form-input participants-input-flex"
        />
        <button type="submit" className="btn btn-primary">
          <UserPlus size={16} />
          <span>Añadir</span>
        </button>
      </form>

      {participants.length === 0 ? (
        <div className="empty-state">
          No hay participantes añadidos todavía. Agrega al menos uno para calcular.
        </div>
      ) : (
        <div className="participants-list">
          {participants.map((p) => (
            <div key={p.id} className="participant-chip">
              <span className="participant-dot" style={{ backgroundColor: p.color }} />

              {editingId === p.id ? (
                <div className="participant-edit-container">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="form-input participant-edit-input"
                    autoFocus
                  />
                  <button onClick={() => saveEditing(p.id)} className="btn-icon participant-btn-success" title="Guardar">
                    <Check size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <span className="participant-name-label">{p.name}</span>
                  <button onClick={() => startEditing(p)} className="btn-icon participant-action-btn" title="Editar">
                    <Edit2 size={12} />
                  </button>
                </>
              )}

              <button onClick={() => onRemove(p.id)} className="btn-icon participant-action-btn" title="Eliminar">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
