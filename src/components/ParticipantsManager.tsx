import React, { useState } from 'react';
import type { Participant } from '../domain/types';
import { Users, UserPlus, Trash2, Edit2, Check } from 'lucide-react';

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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
          <Users className="w-5 h-5 text-indigo-600" />
          <span>Participantes ({participants.length})</span>
        </h2>
      </div>

      <form onSubmit={handleAddSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nombre del participante..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        />
        <button
          type="submit"
          className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>Añadir</span>
        </button>
      </form>

      {participants.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          No hay participantes añadidos todavía. Agrega al menos uno para calcular.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {participants.map((p) => (
            <div
              key={p.id}
              className="flex items-center space-x-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-sm group"
            >
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: p.color }}
              />

              {editingId === p.id ? (
                <div className="flex items-center space-x-1">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="w-24 px-2 py-0.5 text-xs border border-gray-300 rounded outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => saveEditing(p.id)}
                    className="text-green-600 hover:text-green-700 p-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="font-medium text-gray-700">{p.name}</span>
                  <button
                    onClick={() => startEditing(p)}
                    className="text-gray-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}

              <button
                onClick={() => onRemove(p.id)}
                className="text-gray-400 hover:text-red-600 transition ml-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
