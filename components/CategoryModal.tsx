import React, { useState, useEffect } from 'react';
import type { Category, EvaluationPeriod } from '../types';
import Modal from './Modal';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Category, evaluationPeriodId: string) => void;
  categoryToEdit: Category | null;
  evaluationPeriodId: string;
  evaluationPeriods?: EvaluationPeriod[];
}

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, onSave, categoryToEdit, evaluationPeriodId, evaluationPeriods = [] }) => {
  const [name, setName] = useState('');
  const [weight, setWeight] = useState<number | ''>('');
  const [type, setType] = useState<'normal' | 'recovery' | 'period_recovery'>('normal');
  const [recoversEvaluationPeriodIds, setRecoversEvaluationPeriodIds] = useState<string[]>([]);

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setWeight(categoryToEdit.weight);
      setType(categoryToEdit.type || 'normal');
      setRecoversEvaluationPeriodIds(categoryToEdit.recoversEvaluationPeriodIds || []);
    } else {
      setName('');
      setWeight('');
      setType('normal');
      setRecoversEvaluationPeriodIds([]);
    }
  }, [categoryToEdit, isOpen, evaluationPeriods]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'period_recovery' && recoversEvaluationPeriodIds.length === 0) {
        alert("Por favor, selecciona al menos una evaluación a recuperar.");
        return;
    }
    if (name && weight !== '' && weight >= 0 && weight <= 100) {
      onSave({
        id: categoryToEdit ? categoryToEdit.id : `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name,
        weight: Number(weight),
        evaluationPeriodId: categoryToEdit ? categoryToEdit.evaluationPeriodId : evaluationPeriodId,
        type,
        recoversEvaluationPeriodIds: type === 'period_recovery' ? recoversEvaluationPeriodIds : undefined,
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
           <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Categoría</label>
           <div className="flex flex-col space-y-2">
             <label className="flex items-center space-x-2 cursor-pointer">
               <input
                 type="radio"
                 name="categoryType"
                 checked={type === 'normal'}
                 onChange={() => setType('normal')}
                 className="h-4 w-4 text-blue-600 focus:ring-blue-500"
               />
               <span className="text-sm font-medium text-slate-700">Normal</span>
             </label>
             
             {evaluationPeriodId !== 'final' && (
               <label className="flex items-center space-x-2 cursor-pointer">
                 <input
                   type="radio"
                   name="categoryType"
                   checked={type === 'recovery'}
                   onChange={() => setType('recovery')}
                   className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                 />
                 <span className="text-sm font-medium text-slate-700">Recuperación de Tareas</span>
               </label>
             )}

             {(evaluationPeriodId === 'final' || type === 'period_recovery') && (
               <label className="flex items-center space-x-2 cursor-pointer">
                 <input
                   type="radio"
                   name="categoryType"
                   checked={type === 'period_recovery'}
                   onChange={() => setType('period_recovery')}
                   className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                 />
                 <span className="text-sm font-medium text-slate-700">Recuperación de Evaluación</span>
               </label>
             )}
           </div>

          {type === 'recovery' && (
            <p className="text-xs text-slate-500 mt-2 p-2 bg-slate-50 rounded border border-slate-200">
              Las notas de las tareas en esta categoría reemplazarán las notas anteriores de los criterios evaluados en este período.
            </p>
          )}

          {type === 'period_recovery' && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <label className="block text-sm font-medium text-slate-700 mb-2">Evaluaciones que recupera</label>
                <div className="space-y-2">
                    {evaluationPeriods.map(p => (
                        <label key={p.id} className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={recoversEvaluationPeriodIds.includes(p.id)}
                                onChange={(e) => {
                                    if (e.target.checked) setRecoversEvaluationPeriodIds(prev => [...prev, p.id]);
                                    else setRecoversEvaluationPeriodIds(prev => prev.filter(id => id !== p.id));
                                }}
                                className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-slate-700">{p.name}</span>
                        </label>
                    ))}
                </div>
                {recoversEvaluationPeriodIds.length === 0 && (
                  <p className="text-xs text-red-500 mt-2 font-medium">Por favor, selecciona al menos una evaluación.</p>
                )}
                <p className="text-xs text-blue-700 mt-3">
                    La media obtenida en esta categoría reemplazará automáticamente la nota de las evaluaciones seleccionadas, pero <strong>solo en las evaluaciones suspensas (nota menor al aprobado) y si la nota de recuperación es superior</strong>.
                </p>
            </div>
          )}
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