import React, { useState, useEffect } from 'react';
import type { Category } from '../types';
import Modal from './Modal';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Category, evaluationPeriodId: string) => void;
  categoryToEdit: Category | null;
  evaluationPeriodId: string;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, onSave, categoryToEdit, evaluationPeriodId }) => {
  const [name, setName] = useState('');
  const [weight, setWeight] = useState<number | ''>('');
  const [type, setType] = useState<'normal' | 'recovery'>('normal');

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setWeight(categoryToEdit.weight);
      setType(categoryToEdit.type || 'normal');
    } else {
      setName('');
      setWeight('');
      setType('normal');
    }
  }, [categoryToEdit, isOpen]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && weight !== '' && weight >= 0 && weight <= 100) {
      onSave({
        id: categoryToEdit ? categoryToEdit.id : `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name,
        weight: Number(weight),
        evaluationPeriodId: categoryToEdit ? categoryToEdit.evaluationPeriodId : evaluationPeriodId,
        type,
      }, evaluationPeriodId);
      onClose();
    } else {
        alert("Por favor, introduce un nombre y una ponderación válida (0-100).");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={categoryToEdit ? 'Editar Categoría' : 'Nueva Categoría'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nombre de la Categoría</label>
          <input
            type="text" id="name" value={name} onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="weight" className="block text-sm font-medium text-slate-700">Ponderación de la Categoría (%)</label>
          <input
            type="number" id="weight" value={weight} onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required min="0" max="100"
          />
        </div>
        <div>
          <label className="flex items-center space-x-2 cursor-pointer mt-2">
            <input
              type="checkbox"
              checked={type === 'recovery'}
              onChange={(e) => setType(e.target.checked ? 'recovery' : 'normal')}
              className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-slate-700">Es una categoría de recuperación</span>
          </label>
          <p className="text-xs text-slate-500 mt-1 pl-6">
            Las notas de las tareas en esta categoría reemplazarán las notas anteriores de los criterios evaluados en este período.
          </p>
        </div>
        <div className="flex justify-end pt-4 space-x-2 border-t mt-4">
          <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Cancelar
          </button>
          <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Guardar Categoría
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryModal;