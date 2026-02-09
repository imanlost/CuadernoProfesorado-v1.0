
import React, { useState, useEffect, useMemo } from 'react';
import type { Assignment, EvaluationCriterion, LinkedCriterion, Category, SpecificCompetence, KeyCompetence, OperationalDescriptor, ProgrammingUnit, AcademicConfiguration, EvaluationPeriod, EvaluationTool } from '../types';
import Modal from './Modal';
import { TrashIcon, ChevronDownIcon, ChevronRightIcon, PlusIcon, LinkIcon } from './Icons';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assignment: Omit<Assignment, 'id' | 'categoryId'> & { id?: string }) => void;
  assignmentToEdit: Assignment | null;
  category: Category;
  criteria: EvaluationCriterion[];
  specificCompetences: SpecificCompetence[];
  keyCompetences: KeyCompetence[];
  programmingUnits: ProgrammingUnit[];
  evaluationPeriods: EvaluationPeriod[];
  academicConfiguration: AcademicConfiguration;
  evaluationTools: EvaluationTool[];
  allAssignments: Assignment[];
  allCategories: Category[];
}

const AssignmentModal: React.FC<AssignmentModalProps> = (props) => {
  const { isOpen, onClose, onSave, assignmentToEdit, category, criteria, specificCompetences, keyCompetences, programmingUnits, evaluationPeriods, academicConfiguration, evaluationTools, allAssignments, allCategories } = props;
  
  const [name, setName] = useState('');
  const [date, setDate] = useState<string>('');
  const [evaluationPeriodId, setEvaluationPeriodId] = useState<string>(category.evaluationPeriodId);
  const [linkedCriteria, setLinkedCriteria] = useState<LinkedCriterion[]>([]);
  const [programmingUnitId, setProgrammingUnitId] = useState<string | undefined>(undefined);
  const [evaluationMethod, setEvaluationMethod] = useState<Assignment['evaluationMethod']>('direct_grade');
  const [evaluationToolId, setEvaluationToolId] = useState<string | undefined>(undefined);
  const [recoversAssignmentIds, setRecoversAssignmentIds] = useState<string[]>([]);
  
  // UI State for the new selector
  const [isCriteriaSelectorOpen, setIsCriteriaSelectorOpen] = useState(false);
  // New State: Toggle for using global criteria on tools
  const [useGlobalToolCriteria, setUseGlobalToolCriteria] = useState(false);

  const descriptorMap = useMemo(() => {
    const map = new Map<string, OperationalDescriptor>();
    keyCompetences.forEach(kc => {
      (kc.descriptors || []).forEach(desc => {
        map.set(desc.id, desc);
      });
    });
    return map;
  }, [keyCompetences]);
  
  const criterionToCompetenceMap = useMemo(() => {
    const map = new Map<string, SpecificCompetence>();
    criteria.forEach(crit => {
      const sc = specificCompetences.find(sc => sc.id === crit.competenceId);
      if (sc) {
        map.set(crit.id, sc);
      }
    });
    return map;
  }, [criteria, specificCompetences]);

  useEffect(() => {
    if (assignmentToEdit) {
      setName(assignmentToEdit.name);
      setDate(assignmentToEdit.date || '');
      setEvaluationPeriodId(assignmentToEdit.evaluationPeriodId);
      setProgrammingUnitId(assignmentToEdit.programmingUnitId);
      setEvaluationMethod(assignmentToEdit.evaluationMethod || 'direct_grade');
      setEvaluationToolId(assignmentToEdit.evaluationToolId);
      setRecoversAssignmentIds(assignmentToEdit.recoversAssignmentIds || []);
      const sanitizedLinkedCriteria = (assignmentToEdit.linkedCriteria || []).map(lc => ({
        ...lc,
        selectedDescriptorIds: lc.selectedDescriptorIds || [],
      }));
      setLinkedCriteria(sanitizedLinkedCriteria);
      
      // Determine if global tool criteria mode should be active
      if (assignmentToEdit.evaluationMethod !== 'direct_grade' && sanitizedLinkedCriteria.length > 0) {
          setUseGlobalToolCriteria(true);
      } else {
          setUseGlobalToolCriteria(false);
      }

    } else {
      setName('');
      setDate('');
      setEvaluationPeriodId(category.evaluationPeriodId);
      setProgrammingUnitId(undefined);
      setLinkedCriteria([]);
      setEvaluationMethod('direct_grade');
      setEvaluationToolId(undefined);
      setRecoversAssignmentIds([]);
      setIsCriteriaSelectorOpen(true); // Open selector by default for new assignments
      setUseGlobalToolCriteria(false);
    }
  }, [assignmentToEdit, isOpen, category]);
  
  useEffect(() => {
    if (date) {
        const period = academicConfiguration.evaluationPeriods.find(p => date >= p.startDate && date <= p.endDate);
        if (period) {
            setEvaluationPeriodId(period.id);
        }
    }
  }, [date, academicConfiguration.evaluationPeriods]);


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

  const handleToggleCriterion = (criterionId: string) => {
      const isSelected = linkedCriteria.some(lc => lc.criterionId === criterionId);
      if (isSelected) {
          handleRemoveCriterion(criterionId);
      } else {
          handleAddCriterion(criterionId);
      }
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
    if (name) {
      // Logic to ensure consistency: if tool is selected but "useGlobal" is unchecked, clear criteria
      let finalLinkedCriteria = linkedCriteria;
      if (evaluationMethod !== 'direct_grade' && !useGlobalToolCriteria) {
          finalLinkedCriteria = [];
      }

      const assignmentData = {
        name,
        date,
        evaluationPeriodId,
        programmingUnitId,
        evaluationMethod,
        evaluationToolId: evaluationMethod !== 'direct_grade' ? evaluationToolId : undefined,
        linkedCriteria: finalLinkedCriteria,
        recoversAssignmentIds: category.type === 'recovery' ? recoversAssignmentIds : [],
      };
      if (assignmentToEdit) {
        onSave({ ...assignmentData, id: assignmentToEdit.id });
      } else {
        onSave(assignmentData);
      }
      onClose();
    }
  };

  const availableToolsForMethod = useMemo(() => {
      return evaluationTools.filter(tool => tool.type === evaluationMethod);
  }, [evaluationTools, evaluationMethod]);
  
  const modalTitle = assignmentToEdit 
    ? `Editar Tarea en '${category.name}'` 
    : `Nueva Tarea en '${category.name}'`;
    
  const showCriteriaSection = category.type !== 'recovery' || recoversAssignmentIds.length === 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="3xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nombre de la Tarea</label>
            <input
              type="text" id="name" value={name} onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm" required
            />
          </div>
          <div className="lg:col-span-1">
            <label htmlFor="date" className="block text-sm font-medium text-slate-700">Fecha</label>
            <input
              type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm"
            />
          </div>
          <div className="lg:col-span-1">
            <label htmlFor="evaluation-period" className="block text-sm font-medium text-slate-700">Periodo</label>
            <select
              id="evaluation-period" value={evaluationPeriodId} onChange={(e) => setEvaluationPeriodId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm"
            >
              {evaluationPeriods.map(period => <option key={period.id} value={period.id}>{period.name}</option>)}
            </select>
          </div>
        </div>
        
        {category.type === 'recovery' && (
          <RecoverySettings
            allAssignments={allAssignments}
            allCategories={allCategories}
            currentAssignmentId={assignmentToEdit?.id}
            evaluationPeriodId={evaluationPeriodId}
            selectedIds={recoversAssignmentIds}
            setSelectedIds={setRecoversAssignmentIds}
          />
        )}

        <div>
            <label htmlFor="evaluation-method" className="block text-sm font-medium text-slate-700">Método de Evaluación</label>
            <select
              id="evaluation-method" value={evaluationMethod} onChange={(e) => setEvaluationMethod(e.target.value as Assignment['evaluationMethod'])}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm"
            >
              <option value="direct_grade">Nota numérica directa por criterio</option>
              <option value="checklist">Lista de Cotejo</option>
              <option value="rating_scale">Escala de Valoración</option>
              <option value="rubric">Rúbrica</option>
            </select>
        </div>

        {/* Instrument Selection Logic */}
        {evaluationMethod !== 'direct_grade' && (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="mb-4">
                    <label htmlFor="evaluation-tool" className="block text-sm font-medium text-slate-700">Instrumento de Evaluación</label>
                    <select
                      id="evaluation-tool" value={evaluationToolId || ''} onChange={(e) => setEvaluationToolId(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm"
                      required
                    >
                      <option value="" disabled>Selecciona un instrumento...</option>
                      {availableToolsForMethod.map(tool => (
                        <option key={tool.id} value={tool.id}>{tool.name}</option>
                      ))}
                    </select>
                     <p className="text-xs text-slate-500 mt-1">
                        El instrumento asigna las calificaciones. Puedes editarlo en Ajustes.
                    </p>
                </div>

                {showCriteriaSection && (
                    <div className="mt-4 border-t pt-4">
                        <label className="flex items-start space-x-3 cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="mt-1 h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                checked={useGlobalToolCriteria}
                                onChange={e => setUseGlobalToolCriteria(e.target.checked)}
                            />
                            <div>
                                <span className="block text-sm font-medium text-slate-900">Vincular nota global a Criterios LOMLOE</span>
                                <span className="block text-xs text-slate-500">
                                    Si activas esto, la nota global calculada por el instrumento (0-10) se aplicará directamente a los criterios que selecciones abajo, con la ponderación que definas. Esto ignorará las vinculaciones internas de los ítems del instrumento.
                                </span>
                            </div>
                        </label>
                    </div>
                )}
            </div>
        )}

        {/* Criteria Selector Logic: Shown if Direct Grade OR (Tool + Global Mode Enabled) */}
        {(evaluationMethod === 'direct_grade' || useGlobalToolCriteria) && showCriteriaSection && (
        <div className="space-y-4 mt-4">
            {evaluationMethod !== 'direct_grade' && <h4 className="text-sm font-bold text-slate-700">Selección de Criterios Globales</h4>}
            
            {/* New Criteria Selector */}
            <div className="border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden">
                <button 
                    type="button"
                    onClick={() => setIsCriteriaSelectorOpen(!isCriteriaSelectorOpen)}
                    className="w-full flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100 text-left text-sm font-medium text-slate-700 transition-colors"
                >
                    <span className="flex items-center gap-2">
                        <PlusIcon className="w-4 h-4 text-blue-600" />
                        Seleccionar Criterios de Evaluación
                        <span className="ml-2 bg-blue-100 text-blue-800 py-0.5 px-2 rounded-full text-xs">
                            {linkedCriteria.length} seleccionados
                        </span>
                    </span>
                    {isCriteriaSelectorOpen ? <ChevronDownIcon className="w-5 h-5 text-slate-400" /> : <ChevronRightIcon className="w-5 h-5 text-slate-400" />}
                </button>
                
                {isCriteriaSelectorOpen && (
                    <div className="p-3 border-t border-slate-200 max-h-60 overflow-y-auto bg-white">
                        <div className="grid grid-cols-1 gap-2">
                            {criteria.length === 0 ? (
                                <p className="text-sm text-slate-500 italic">No hay criterios definidos para este curso.</p>
                            ) : (
                                criteria.map(c => {
                                    const isSelected = linkedCriteria.some(lc => lc.criterionId === c.id);
                                    return (
                                        <label 
                                            key={c.id} 
                                            className={`flex items-start gap-3 p-2 rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border border-blue-100' : 'hover:bg-slate-50 border border-transparent'}`}
                                        >
                                            <input 
                                                type="checkbox" 
                                                checked={isSelected}
                                                onChange={() => handleToggleCriterion(c.id)}
                                                className="mt-1 h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                            />
                                            <div className="flex-1">
                                                <span className="block text-sm font-semibold text-slate-800">{c.code}</span>
                                                <span className="block text-xs text-slate-600">{c.description}</span>
                                            </div>
                                        </label>
                                    )
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>

           {linkedCriteria.length > 0 && (
               <>
                <h4 className="text-sm font-medium text-slate-700 pt-2">Configuración de Descriptores y Peso</h4>
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
                                            onChange={(e) => handleCriterionRatioChange(lc.criterionId, Number(e.target.value))}
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
                                                    <input 
                                                        type="checkbox"
                                                        className="mt-0.5"
                                                        checked={lc.selectedDescriptorIds.includes(desc.id)}
                                                        onChange={(e) => handleDescriptorSelectionChange(lc.criterionId, desc.id, e.target.checked)}
                                                    />
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
               </>
            )}
            
            {linkedCriteria.length === 0 && (
              <p className="text-sm text-slate-400 italic text-center py-4 bg-slate-50 rounded-lg">
                Sin criterios seleccionados. Abre el selector arriba para añadir criterios.
              </p>
            )}
        </div>
        )}

        {evaluationMethod === 'direct_grade' && !showCriteriaSection && (
            <div className="text-sm text-center italic py-4 bg-blue-50 text-blue-800 rounded-lg">
                La nota de esta tarea se aplicará a todos los criterios de las tareas recuperadas.
            </div>
        )}

        <div className="flex justify-end pt-4 space-x-2 border-t mt-6">
          <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Cancelar
          </button>
          <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Guardar Tarea
          </button>
        </div>
      </form>
    </Modal>
  );
};


interface RecoverySettingsProps {
    allAssignments: Assignment[];
    allCategories: Category[];
    currentAssignmentId?: string;
    evaluationPeriodId: string;
    selectedIds: string[];
    setSelectedIds: (ids: string[]) => void;
}

const RecoverySettings: React.FC<RecoverySettingsProps> = ({ allAssignments, allCategories, currentAssignmentId, evaluationPeriodId, selectedIds, setSelectedIds }) => {
    
    const assignmentsToRecover = useMemo(() => {
        const recoveryCategoryIds = new Set(allCategories.filter(c => c.type === 'recovery').map(c => c.id));
        return allAssignments.filter(a =>
            a.evaluationPeriodId === evaluationPeriodId &&
            !recoveryCategoryIds.has(a.categoryId) &&
            a.id !== currentAssignmentId
        );
    }, [allAssignments, allCategories, currentAssignmentId, evaluationPeriodId]);

    // FIX: Explicitly typed the return value of useMemo to resolve type inference issues.
    const assignmentsGroupedByCategory = useMemo<Record<string, Assignment[]>>(() => {
        const groups: Record<string, Assignment[]> = {};
        for (const assignment of assignmentsToRecover) {
            if (!groups[assignment.categoryId]) {
                groups[assignment.categoryId] = [];
            }
            groups[assignment.categoryId].push(assignment);
        }
        return groups;
    }, [assignmentsToRecover]);

    const handleToggle = (assignmentId: string, checked: boolean) => {
        const newSet = new Set(selectedIds);
        if (checked) newSet.add(assignmentId);
        else newSet.delete(assignmentId);
        setSelectedIds(Array.from(newSet));
    };

    const handleSelectCategory = (categoryId: string, checked: boolean) => {
        const newSet = new Set(selectedIds);
        const assignmentIdsInCategory = assignmentsGroupedByCategory[categoryId]?.map(a => a.id) || [];
        if (checked) {
            assignmentIdsInCategory.forEach(id => newSet.add(id));
        } else {
            assignmentIdsInCategory.forEach(id => newSet.delete(id));
        }
        setSelectedIds(Array.from(newSet));
    };

    return (
        <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-bold text-blue-800 mb-2">Opciones de Recuperación</h4>
            <p className="text-xs text-blue-700 mb-3">Selecciona las tareas que se recuperan con esta actividad. Las notas de los criterios de las tareas seleccionadas serán reemplazadas por las obtenidas aquí.</p>

            <div className="max-h-48 overflow-y-auto space-y-3 pr-2">
                {/* FIX: Explicitly type the destructured arguments from Object.entries to fix type inference failure. */}
                {Object.entries(assignmentsGroupedByCategory).map(([categoryId, assignments]: [string, Assignment[]]) => {
                    const category = allCategories.find(c => c.id === categoryId);
                    if (!category) return null;
                    
                    const allInCategorySelected = assignments.every(a => selectedIds.includes(a.id));

                    return (
                        <div key={categoryId}>
                            <label className="flex items-center space-x-2 p-2 bg-blue-100 rounded-t-md border-b border-blue-200">
                                <input
                                    type="checkbox"
                                    checked={allInCategorySelected}
                                    onChange={e => handleSelectCategory(categoryId, e.target.checked)}
                                    className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                                />
                                <span className="font-semibold text-sm text-blue-900">Recuperar toda la categoría: {category.name}</span>
                            </label>
                            <div className="bg-white p-2 rounded-b-md">
                                {assignments.map(a => (
                                    <label key={a.id} className="flex items-center space-x-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(a.id)}
                                            onChange={e => handleToggle(a.id, e.target.checked)}
                                            className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-slate-700">{a.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


export default AssignmentModal;
