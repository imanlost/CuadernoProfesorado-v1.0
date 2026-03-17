
import React, { useState, useEffect, useMemo } from 'react';
import Modal from './Modal';
import type { Student, Assignment, Grade, EvaluationCriterion, EvaluationTool, Rubric } from '../types';
import { calculateToolGlobalScore } from '../services/gradeCalculations';
import { ChevronRightIcon } from './Icons';

interface GradeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  assignment: Assignment;
  grade: Grade | null;
  criteriaList: EvaluationCriterion[];
  onSave: (studentId: string, assignmentId: string, data: { criterionScores: Record<string, number | null> } | { toolResults: Record<string, boolean | string> }, nextStudent?: boolean) => void;
  evaluationTools: EvaluationTool[];
  allAssignments: Assignment[];
  students: Student[]; // Added to know the list for navigation
}

const GradeEntryModal: React.FC<GradeEntryModalProps> = (props) => {
  const { isOpen, onClose, student, assignment, grade, criteriaList, onSave, evaluationTools, allAssignments, students } = props;
  
  const [scores, setScores] = useState<Record<string, number | null>>({});
  const [toolResults, setToolResults] = useState<Record<string, boolean | string>>({});
  const [singleGrade, setSingleGrade] = useState<string>('');
  
  const currentStudentIndex = useMemo(() => students.findIndex(s => s.id === student.id), [students, student.id]);
  const hasNextStudent = currentStudentIndex < students.length - 1;

  const evaluationTool = useMemo(() => {
    if (assignment.evaluationMethod !== 'direct_grade' && assignment.evaluationToolId) {
        return evaluationTools.find(t => t.id === assignment.evaluationToolId);
    }
    return null;
  }, [assignment, evaluationTools]);

  const isRecoveryTaskWithAssignments = useMemo(() => 
    !!(assignment.recoversAssignmentIds && assignment.recoversAssignmentIds.length > 0)
  , [assignment]);
  
  useEffect(() => {
    if (isOpen) {
        if (assignment.evaluationMethod === 'direct_grade') {
            if (isRecoveryTaskWithAssignments) {
                const firstGradeVal = grade?.criterionScores ? Object.values(grade.criterionScores)[0] : null;
                setSingleGrade(firstGradeVal != null ? String(firstGradeVal) : '');
                setScores({});
            } else {
                const initialScores: Record<string, number | null> = {};
                assignment.linkedCriteria.forEach(lc => {
                    initialScores[lc.criterionId] = grade?.criterionScores?.[lc.criterionId] ?? null;
                });
                setScores(initialScores);
                setSingleGrade('');
            }
        } else {
            setToolResults(grade?.toolResults || {});
            setSingleGrade('');
        }
    }
  }, [isOpen, grade, assignment, isRecoveryTaskWithAssignments, student.id]); // Added student.id dependency to reset when switching students

  const handleScoreChange = (criterionId: string, value: string) => {
    setSingleGrade('');
    if (value === '') {
      setScores(prev => ({ ...prev, [criterionId]: null }));
      return;
    }
    const parsedValue = parseFloat(value.replace(',', '.'));
    const newScore = isNaN(parsedValue) ? null : Math.max(0, Math.min(10, parsedValue));
    setScores(prev => ({ ...prev, [criterionId]: newScore }));
  };
  
  const handleSingleGradeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSingleGrade(value);
    if (value === '') return;
    const parsedValue = parseFloat(value.replace(',', '.'));
    const newScore = isNaN(parsedValue) ? null : Math.max(0, Math.min(10, parsedValue));
    if (newScore === null) return;

    if (assignment.evaluationMethod === 'direct_grade' && !isRecoveryTaskWithAssignments) {
        const newScores: Record<string, number | null> = {};
        for (const lc of assignment.linkedCriteria) {
            newScores[lc.criterionId] = newScore;
        }
        setScores(newScores);
    } else if (evaluationTool?.type === 'rating_scale' || evaluationTool?.type === 'rubric') {
        const maxPoints = Math.max(...evaluationTool.levels.map(l => l.points));
        const targetPoints = (newScore / 10) * maxPoints;
        const closestLevel = evaluationTool.levels.reduce((prev, curr) => 
            Math.abs(curr.points - targetPoints) < Math.abs(prev.points - targetPoints) ? curr : prev
        );
        const newResults: Record<string, string> = {};
        evaluationTool.items.forEach(item => {
            newResults[item.id] = closestLevel.id;
        });
        setToolResults(newResults);
    }
  };

  const handleToolResultChange = (itemId: string, value: boolean | string) => {
      setToolResults(prev => ({ ...prev, [itemId]: value }));
  };

  const handleSaveInternal = (e: React.FormEvent, next: boolean) => {
    e.preventDefault();
    if (assignment.evaluationMethod === 'direct_grade') {
        if (isRecoveryTaskWithAssignments) {
            const gradeValue = singleGrade !== '' ? parseFloat(singleGrade.replace(',', '.')) : null;
            const newScores: Record<string, number | null> = {};
            if (gradeValue !== null && !isNaN(gradeValue)) {
                newScores['recovery_grade'] = Math.max(0, Math.min(10, gradeValue));
            }
            onSave(student.id, assignment.id, { criterionScores: newScores }, next);
        } else {
            onSave(student.id, assignment.id, { criterionScores: scores }, next);
        }
    } else {
        if (assignment.linkedCriteria && assignment.linkedCriteria.length > 0 && evaluationTool) {
            const globalScore = calculateToolGlobalScore(evaluationTool, toolResults);
            const derivedCriterionScores: Record<string, number | null> = {};
            
            assignment.linkedCriteria.forEach(lc => {
                derivedCriterionScores[lc.criterionId] = globalScore;
            });

            onSave(student.id, assignment.id, { toolResults, criterionScores: derivedCriterionScores }, next);
        } else {
            onSave(student.id, assignment.id, { toolResults }, next);
        }
    }
  };

  const renderDirectGradeInputs = () => {
    if (isRecoveryTaskWithAssignments) {
        return (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <label className="block text-sm font-medium text-slate-700">Calificación de Recuperación</label>
                <p className="text-xs text-slate-500 mb-2">Esta nota se aplicará a todos los criterios de las tareas recuperadas.</p>
                <input
                    type="number" step="0.01" min="0" max="10" value={singleGrade} onChange={handleSingleGradeChange}
                    className="w-full p-2 text-lg text-center font-semibold border rounded-md" placeholder="-"/>
            </div>
        )
    }

    const totalRatio = assignment.linkedCriteria.reduce((sum, lc) => sum + lc.ratio, 0);
    return (
        <>
            {assignment.linkedCriteria.length > 1 && (
                <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <label className="block text-sm font-medium text-slate-700">Calificación Única (opcional)</label>
                    <input
                        type="number" step="0.01" min="0" max="10" value={singleGrade} onChange={handleSingleGradeChange}
                        className="w-full p-2 text-lg text-center font-semibold border rounded-md" placeholder="-"/>
                </div>
            )}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {assignment.linkedCriteria.map(lc => {
                    const criterion = criteriaList.find(c => c.id === lc.criterionId);
                    if (!criterion) return null;
                    const percentage = totalRatio > 0 ? ((lc.ratio / totalRatio) * 100).toFixed(1) : '0.0';

                    return (
                        <div key={criterion.id} className="flex items-center space-x-3">
                            <label className="flex-grow text-sm">
                                <span className="font-semibold text-slate-700">{criterion.code} ({percentage}%):</span>
                                <span className="text-slate-500 ml-2">{criterion.description}</span>
                            </label>
                            <input
                                type="number" step="0.01" min="0" max="10" value={scores[criterion.id] ?? ''}
                                onChange={(e) => handleScoreChange(criterion.id, e.target.value)}
                                className="w-24 p-2 text-center border rounded-md" placeholder="-"/>
                        </div>
                    );
                })}
            </div>
        </>
    );
  };

  const renderToolInputs = () => {
    if (!evaluationTool) return <p className="text-red-500">Error: Instrumento de evaluación no encontrado.</p>;
    
    if (evaluationTool.type === 'rubric') {
        const rubric = evaluationTool as Rubric;
        return (
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                    <thead>
                        <tr>
                            <th className="border p-2 bg-slate-100 text-left font-semibold">Criterio de la Rúbrica</th>
                            {rubric.levels.map(level => (
                                <th key={level.id} className="border p-2 bg-slate-100 font-semibold w-40">
                                    {level.name} ({level.points} pts)
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rubric.items.map(item => (
                            <tr key={item.id}>
                                <td className="border p-2 bg-slate-50 font-medium">{item.description}</td>
                                {rubric.levels.map(level => {
                                    const isSelected = toolResults[item.id] === level.id;
                                    return (
                                        <td 
                                            key={level.id}
                                            onClick={() => handleToolResultChange(item.id, level.id)}
                                            className={`border p-2 align-top cursor-pointer transition-colors ${isSelected ? 'bg-blue-200 ring-2 ring-blue-500' : 'hover:bg-blue-50'}`}
                                        >
                                            {item.levelDescriptions[level.id] || ''}
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }


    return (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {evaluationTool.items.map(item => (
                <div key={item.id} className="p-3 border rounded-lg bg-slate-50/50">
                    <p className="font-medium text-slate-800 mb-2">{item.description}</p>
                    {evaluationTool.type === 'checklist' && (
                        <label className="flex items-center space-x-2 cursor-pointer p-2 bg-white rounded-md border w-min">
                            <input
                                type="checkbox"
                                checked={!!toolResults[item.id]}
                                onChange={e => handleToolResultChange(item.id, e.target.checked)}
                                className="w-5 h-5 rounded"
                            />
                            <span className="font-semibold">Realizado</span>
                        </label>
                    )}
                    {evaluationTool.type === 'rating_scale' && (
                        <div className="flex items-center gap-2 flex-wrap">
                            {evaluationTool.levels.map(level => (
                                <label key={level.id} className={`cursor-pointer p-2 border rounded-md transition-colors ${toolResults[item.id] === level.id ? 'bg-blue-600 text-white border-blue-700' : 'bg-white hover:bg-blue-50'}`}>
                                    <input
                                        type="radio"
                                        name={`item-${item.id}`}
                                        value={level.id}
                                        checked={toolResults[item.id] === level.id}
                                        onChange={e => handleToolResultChange(item.id, e.target.value)}
                                        className="sr-only"
                                    />
                                    <span className="font-semibold text-sm">{level.name} ({level.points} pts)</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
  };
  
  return (
      <Modal isOpen={isOpen} onClose={onClose} title={`Calificar: ${assignment.name}`} size={assignment.evaluationMethod === 'rubric' ? '4xl' : '2xl'}>
        <div className="space-y-4">
          <p className="text-slate-600 font-medium">Alumn@: <span className="font-bold">{student.name}</span></p>
          
          {assignment.evaluationMethod === 'direct_grade' ? renderDirectGradeInputs() : renderToolInputs()}

          <div className="flex justify-end items-center pt-4 border-t gap-3">
              <button type="button" onClick={onClose} className="bg-white py-2 px-4 border rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50">
                Cancelar
              </button>
              <button onClick={(e) => handleSaveInternal(e, false)} className="inline-flex justify-center py-2 px-4 border shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                Guardar
              </button>
              {hasNextStudent && (
                  <button onClick={(e) => handleSaveInternal(e, true)} className="inline-flex items-center justify-center py-2 px-4 border shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                    Guardar y Siguiente <ChevronRightIcon className="w-4 h-4 ml-1" />
                  </button>
              )}
          </div>
        </div>
      </Modal>
  );
};

export default GradeEntryModal;
