
import React, { useState, useMemo, useEffect } from 'react';
import Modal from './Modal';
import type { ClassData, Assignment, AcademicConfiguration } from '../types';

interface CopyAssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCopy: (targetClassId: string, targetPeriodId: string, targetCategoryId: string) => void;
    sourceAssignment: Assignment;
    allClasses: ClassData[];
    currentClassId: string;
    academicConfiguration: AcademicConfiguration;
}

const CopyAssignmentModal: React.FC<CopyAssignmentModalProps> = ({
    isOpen,
    onClose,
    onCopy,
    sourceAssignment,
    allClasses,
    currentClassId,
    academicConfiguration
}) => {
    const [selectedClassId, setSelectedClassId] = useState<string>(currentClassId);
    const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

    const sourceClass = allClasses.find(c => c.id === currentClassId);

    // Filter classes that share the same courseId (to ensure criteria compatibility)
    const compatibleClasses = useMemo(() => {
        if (!sourceClass) return [];
        return allClasses.filter(c => c.courseId === sourceClass.courseId);
    }, [allClasses, sourceClass]);

    const targetClass = useMemo(() => 
        allClasses.find(c => c.id === selectedClassId), 
    [allClasses, selectedClassId]);

    // Get periods that have categories in the target class (or all periods)
    const availablePeriods = useMemo(() => {
        return academicConfiguration.evaluationPeriods;
    }, [academicConfiguration]);

    // Filter categories based on selected class and period
    const availableCategories = useMemo(() => {
        if (!targetClass || !selectedPeriodId) return [];
        return targetClass.categories.filter(c => c.evaluationPeriodId === selectedPeriodId);
    }, [targetClass, selectedPeriodId]);

    // Reset selections when modal opens or class changes
    useEffect(() => {
        if (isOpen) {
            if (sourceAssignment) {
                setSelectedPeriodId(sourceAssignment.evaluationPeriodId);
                // If copying to same class, default to same category (duplicate). 
                // If different class, try to find category with same name or reset.
                if (selectedClassId === currentClassId) {
                    setSelectedCategoryId(sourceAssignment.categoryId);
                } else {
                    setSelectedCategoryId('');
                }
            }
        }
    }, [isOpen, sourceAssignment, currentClassId]);

    // When class or period changes, try to smart-select a category
    useEffect(() => {
        if (availableCategories.length > 0) {
            // Try to match by name if possible
            const originalCategoryName = sourceClass?.categories.find(c => c.id === sourceAssignment.categoryId)?.name;
            const match = availableCategories.find(c => c.name === originalCategoryName);
            if (match) {
                setSelectedCategoryId(match.id);
            } else if (availableCategories.length === 1) {
                setSelectedCategoryId(availableCategories[0].id);
            } else {
                setSelectedCategoryId('');
            }
        } else {
            setSelectedCategoryId('');
        }
    }, [selectedClassId, selectedPeriodId, availableCategories, sourceClass, sourceAssignment]);

    const handleCopy = () => {
        if (selectedClassId && selectedPeriodId && selectedCategoryId) {
            onCopy(selectedClassId, selectedPeriodId, selectedCategoryId);
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Copiar Tarea y Criterios" size="md">
            <div className="space-y-4">
                <p className="text-sm text-slate-600">
                    Se copiará la tarea <strong>"{sourceAssignment.name}"</strong> con toda su configuración de criterios y pesos.
                </p>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Clase de Destino</label>
                    <select 
                        value={selectedClassId} 
                        onChange={e => setSelectedClassId(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg"
                    >
                        {compatibleClasses.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">Solo se muestran clases del mismo curso/materia.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Periodo de Evaluación</label>
                    <select 
                        value={selectedPeriodId} 
                        onChange={e => setSelectedPeriodId(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg"
                    >
                        <option value="" disabled>Selecciona un periodo...</option>
                        {availablePeriods.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Categoría de Destino</label>
                    <select 
                        value={selectedCategoryId} 
                        onChange={e => setSelectedCategoryId(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg"
                        disabled={availableCategories.length === 0}
                    >
                        <option value="" disabled>
                            {availableCategories.length === 0 ? 'No hay categorías en este periodo' : 'Selecciona una categoría...'}
                        </option>
                        {availableCategories.map(c => (
                            <option key={c.id} value={c.id}>{c.name} ({c.weight}%)</option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-end pt-4 space-x-2 border-t mt-4">
                    <button onClick={onClose} className="bg-white py-2 px-4 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50">
                        Cancelar
                    </button>
                    <button 
                        onClick={handleCopy}
                        disabled={!selectedClassId || !selectedPeriodId || !selectedCategoryId}
                        className="bg-blue-600 text-white py-2 px-4 rounded-lg shadow-sm text-sm font-medium hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                    >
                        Copiar Tarea
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default CopyAssignmentModal;
