

import React, { useState, useEffect, useMemo } from 'react';
import type { Assignment, EvaluationCriterion, LinkedCriterion, Category, SpecificCompetence, KeyCompetence, ClassData, AcademicConfiguration, EvaluationPeriod, OperationalDescriptor } from '../types';
import Modal from './Modal';
import { TrashIcon } from './Icons';

interface CalendarTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (assignment: Omit<Assignment, 'id'>, classId: string) => void;
    selectedDate: Date;
    classes: ClassData[];
    criteria: EvaluationCriterion[];
    specificCompetences: SpecificCompetence[];
    keyCompetences: KeyCompetence[];
    academicConfiguration: AcademicConfiguration;
}

const toYYYYMMDD = (date: Date): string => {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
};

const CalendarTaskModal: React.FC<CalendarTaskModalProps> = (props) => {
    const { isOpen, onClose, onSave, selectedDate, classes, criteria, specificCompetences, keyCompetences, academicConfiguration } = props;

    const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
    const [name, setName] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [linkedCriteria, setLinkedCriteria] = useState<LinkedCriterion[]>([]);
    
    useEffect(() => {
        if (isOpen) {
            setName('');
            setSelectedCategoryId('');
            setLinkedCriteria([]);
            if (!classes.find(c => c.id === selectedClassId)) {
                setSelectedClassId(classes[0]?.id || '');
            }
        }
    }, [isOpen, selectedClassId, classes]);

    const evaluationPeriod = useMemo<EvaluationPeriod | null>(() => {
        const dateStr = toYYYYMMDD(selectedDate);
        return academicConfiguration.evaluationPeriods.find(p => dateStr >= p.startDate && dateStr <= p.endDate) || null;
    }, [selectedDate, academicConfiguration.evaluationPeriods]);

    const selectedClass = useMemo(() => classes.find(c => c.id === selectedClassId), [classes, selectedClassId]);
    
    const availableCategories = useMemo<Category[]>(() => {
        if (!selectedClass || !evaluationPeriod) return [];
        return selectedClass.categories.filter(c => c.evaluationPeriodId === evaluationPeriod.id);
    }, [selectedClass, evaluationPeriod]);

    const availableCriteria = useMemo<EvaluationCriterion[]>(() => {
        if (!selectedClass) return [];
        const linkedIds = new Set(linkedCriteria.map(lc => lc.criterionId));
        return criteria.filter(c => c.courseId === selectedClass.courseId && !linkedIds.has(c.id));
    }, [selectedClass, criteria, linkedCriteria]);

    useEffect(() => {
        if (!availableCategories.find(c => c.id === selectedCategoryId)) {
            setSelectedCategoryId('');
        }
    }, [availableCategories, selectedCategoryId]);

    const descriptorMap = useMemo(() => {
        const map = new Map<string, OperationalDescriptor>();
        keyCompetences.forEach(kc => {
            (kc.descriptors || []).forEach(desc => map.set(desc.id, desc));
        });
        return map;
    }, [keyCompetences]);
      
    const criterionToCompetenceMap = useMemo(() => {
        const map = new Map<string, SpecificCompetence>();
        criteria.forEach(crit => {
            const sc = specificCompetences.find(sc => sc.id === crit.competenceId);
            if (sc) map.set(crit.id, sc);
        });
        return map;
    }, [criteria, specificCompetences]);

    const handleAddCriterion = (criterionId: string) => {
        if (!criterionId) return;
        const specificComp = criterionToCompetenceMap.get(criterionId);
        const allDescriptorIds = specificComp?.keyCompetenceDescriptorIds || [];
        setLinkedCriteria(prev => [...prev, {
            criterionId,
            ratio: 1,
            selectedDescriptorIds: allDescriptorIds,
        }]);
    };
      
    const handleRemoveCriterion = (criterionId: string) => {
        setLinkedCriteria(prev => prev.filter(lc => lc.criterionId !== criterionId));
    };

    const handleCriterionRatioChange = (criterionId: string, newRatio: number) => {
        setLinkedCriteria(prev => prev.map(lc =>
            lc.criterionId === criterionId ? { ...lc, ratio: newRatio >= 0 ? newRatio : 0 } : lc
        ));
    };

    const handleDescriptorSelectionChange = (criterionId: string, descriptorId: string, isSelected: boolean) => {
        setLinkedCriteria(prev => prev.map(lc => {
            if (lc.criterionId === criterionId) {
                const newSelectedIds = new Set(lc.selectedDescriptorIds);
                isSelected ? newSelectedIds.add(descriptorId) : newSelectedIds.delete(descriptorId);
                return { ...lc, selectedDescriptorIds: Array.from(newSelectedIds) };
            }
            return lc;
        }));
    };

    const totalRatio = linkedCriteria.reduce((sum, lc) => sum + lc.ratio, 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && selectedClassId && selectedCategoryId && evaluationPeriod) {
            // FIX: Added missing 'evaluationMethod' property.
            const assignmentData: Omit<Assignment, 'id'> = {
                name,
                categoryId: selectedCategoryId,
                evaluationPeriodId: evaluationPeriod.id,
                date: toYYYYMMDD(selectedDate),
                evaluationMethod: 'direct_grade',
                linkedCriteria,
            };
            onSave(assignmentData, selectedClassId);
            onClose();
        } else {
            alert("Por favor, completa todos los campos: clase, nombre y categoría.");
        }
    };
      
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Nueva Tarea para el ${selectedDate.toLocaleDateString()}`} size="3xl">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg border">
                    <div className="lg:col-span-1">
                        <label htmlFor="class-task" className="block text-sm font-medium text-slate-700">Clase</label>
                        <select
                            id="class-task" value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm"
                            required
                        >
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="lg:col-span-1">
                        <label htmlFor="category-task" className="block text-sm font-medium text-slate-700">Categoría</label>
                        <select
                            id="category-task" value={selectedCategoryId} onChange={e => setSelectedCategoryId(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm"
                            required disabled={availableCategories.length === 0}
                        >
                            <option value="" disabled>{availableCategories.length === 0 ? `No hay categorías en la ${evaluationPeriod?.name || ''}` : 'Selecciona una categoría...'}</option>
                            {availableCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                    </div>
                    <div className="lg:col-span-1">
                         <label htmlFor="name-task" className="block text-sm font-medium text-slate-700">Nombre de la Tarea</label>
                        <input
                            type="text" id="name-task" value={name} onChange={e => setName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm"
                            required
                        />
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-2">Ponderación de Criterios y Descriptores</h4>
                    {linkedCriteria.length === 0 ? (
                        <p className="text-sm text-slate-400 italic text-center py-4 bg-slate-50 rounded-lg">
                            Sin criterios vinculados. La nota de la tarea se introducirá manualmente.
                        </p>
                    ) : (
                        <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                            {linkedCriteria.map(lc => {
                                const criterion = criteria.find(c => c.id === lc.criterionId);
                                const specificComp = criterion ? criterionToCompetenceMap.get(criterion.id) : undefined;
                                const descriptors = (specificComp?.keyCompetenceDescriptorIds || []).map(id => descriptorMap.get(id)).filter(Boolean) as OperationalDescriptor[];
                                const percentage = totalRatio > 0 ? ((lc.ratio / totalRatio) * 100).toFixed(1) : '0.0';
                                return (
                                    <div key={lc.criterionId} className="p-3 border border-slate-200 rounded-lg bg-slate-50/50">
                                        <div className="flex items-center space-x-2">
                                            <div className="flex-grow">
                                                <p className="font-semibold text-slate-800">{criterion?.code}: <span className="font-normal text-slate-600">{criterion?.description}</span></p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="number" min="0" step="0.5" value={lc.ratio}
                                                    onChange={e => handleCriterionRatioChange(lc.criterionId, Number(e.target.value))}
                                                    className="w-16 p-2 text-center border border-slate-300 rounded-lg"
                                                    title="Ratio de ponderación"
                                                />
                                                <span className="text-sm font-semibold text-slate-500 w-16 text-center">{percentage}%</span>
                                                <button type="button" onClick={() => handleRemoveCriterion(lc.criterionId)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="w-5 h-5" /></button>
                                            </div>
                                        </div>
                                        {descriptors.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-slate-200">
                                                <p className="text-xs font-semibold text-slate-600 mb-2">Descriptores Operativos a trabajar ({specificComp?.code}):</p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                                                    {descriptors.map(desc => (
                                                        <label key={desc.id} className="flex items-start space-x-2 cursor-pointer p-1.5 rounded-md hover:bg-slate-200/50">
                                                            <input type="checkbox" className="mt-0.5" checked={lc.selectedDescriptorIds.includes(desc.id)} onChange={e => handleDescriptorSelectionChange(lc.criterionId, desc.id, e.target.checked)} />
                                                            <span className="text-xs text-slate-700"><span className="font-bold">{desc.code}:</span> {desc.description}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <div className="mt-3">
                        <select onChange={e => { handleAddCriterion(e.target.value); e.target.value = ""; }} value="" className="flex-grow mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 rounded-lg" disabled={!selectedClassId}>
                            <option value="" disabled>Añadir criterio a la tarea...</option>
                            {availableCriteria.map(c => <option key={c.id} value={c.id}>{c.code} - {c.description}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex justify-end pt-4 space-x-2 border-t mt-6">
                    <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50">Cancelar</button>
                    <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700">Guardar Tarea</button>
                </div>
            </form>
        </Modal>
    );
};

export default CalendarTaskModal;