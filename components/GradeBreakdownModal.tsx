
import React from 'react';
import type { Student, ClassData, AcademicConfiguration, EvaluationPeriod } from '../types';
import { calculateDetailedPeriodGradeBreakdown, getGradeColorClass, calculateOverallFinalGradeForStudent } from '../services/gradeCalculations';
import Modal from './Modal';
import { CalculatorIcon, InformationCircleIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface GradeBreakdownModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: Student;
    classData: ClassData;
    period: EvaluationPeriod | { id: 'final'; name: string };
    academicConfiguration: AcademicConfiguration;
    onStudentChange?: (student: Student) => void;
}

const GradeBreakdownModal: React.FC<GradeBreakdownModalProps> = ({ isOpen, onClose, student, classData, period, academicConfiguration, onStudentChange }) => {
    const breakdown = React.useMemo(() => {
        if (period.id === 'final') return null;
        return calculateDetailedPeriodGradeBreakdown(student.id, classData, period.id);
    }, [student.id, classData, period.id]);

    const currentIndex = classData.students.findIndex(s => s.id === student.id);
    const hasPrevStudent = currentIndex > 0;
    const hasNextStudent = currentIndex < classData.students.length - 1;

    const handlePrevStudent = () => {
        if (hasPrevStudent && onStudentChange) {
            onStudentChange(classData.students[currentIndex - 1]);
        }
    };

    const handleNextStudent = () => {
        if (hasNextStudent && onStudentChange) {
            onStudentChange(classData.students[currentIndex + 1]);
        }
    };

    const handleStudentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        const selectedStudent = classData.students.find(s => s.id === selectedId);
        if (selectedStudent && onStudentChange) {
            onStudentChange(selectedStudent);
        }
    };

    if (!breakdown && period.id !== 'final') return null;

    const finalCourseGrade = React.useMemo(() => {
        if (period.id !== 'final') return null;
        // Import and calculate overall final grade
        const result = calculateOverallFinalGradeForStudent(student.id, classData, academicConfiguration);
        return result.grade !== 'N/A' ? parseFloat(result.grade) : null;
    }, [student.id, classData, period.id, academicConfiguration]);

    const displayedGrade = period.id === 'final' ? finalCourseGrade : breakdown?.finalGrade;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Desglose de Calificación" size="4xl">
            <div className="space-y-6">
                {/* Student Selector / Navigation */}
                <div className="flex justify-between items-center pb-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                            <button 
                                onClick={handlePrevStudent}
                                disabled={!hasPrevStudent}
                                className="p-1.5 rounded-md text-slate-600 hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
                                title="Alumno anterior"
                            >
                                <ChevronLeftIcon className="w-5 h-5" />
                            </button>
                            
                            <select 
                                value={student.id}
                                onChange={handleStudentSelect}
                                className="bg-transparent border-none text-lg font-bold text-slate-800 focus:ring-0 cursor-pointer py-1 pr-8 appearance-none hover:bg-white hover:shadow-sm rounded-md transition-all"
                                style={{ backgroundImage: 'none' }}
                            >
                                {classData.students.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>

                            <button 
                                onClick={handleNextStudent}
                                disabled={!hasNextStudent}
                                className="p-1.5 rounded-md text-slate-600 hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
                                title="Siguiente alumno"
                            >
                                <ChevronRightIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">Periodo</span>
                        <span className="text-sm font-bold text-slate-700">{period.name}</span>
                    </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-slate-800">Nota Final</span>
                        <span className={`text-2xl font-black px-3 py-1 rounded-md ${getGradeColorClass(displayedGrade ?? null, academicConfiguration.gradeScale)}`}>
                            {displayedGrade?.toFixed(2) ?? '-'}
                        </span>
                    </div>
                </div>

                {breakdown && (
                    <div className="space-y-4">
                        <h4 className="font-bold text-slate-700 flex items-center gap-2">
                            <CalculatorIcon className="w-5 h-5 text-blue-600" />
                            Cálculo por Categorías
                        </h4>
                        
                        <div className="space-y-3">
                            {breakdown.categories.map(cat => (
                                <div key={cat.id} className="border rounded-lg overflow-hidden">
                                    <div className="bg-slate-100 px-4 py-2 flex justify-between items-center border-b">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-700">{cat.name}</span>
                                            <span className="text-xs font-medium bg-white px-2 py-0.5 rounded-full border border-slate-200 text-slate-500">
                                                Peso: {cat.weight}%
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-500">Media:</span>
                                            <span className={`font-bold ${getGradeColorClass(cat.average, academicConfiguration.gradeScale)} px-2 py-0.5 rounded text-sm`}>
                                                {cat.average?.toFixed(2) ?? '-'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-white">
                                        {cat.assignments.length > 0 ? (
                                            <ul className="space-y-1.5">
                                                {cat.assignments.map(asg => (
                                                    <li key={asg.id} className="flex justify-between items-center text-sm">
                                                        <span className="text-slate-600 truncate max-w-[70%]">{asg.name}</span>
                                                        <span className={`font-mono font-medium ${asg.score === null ? 'text-slate-300' : 'text-slate-700'}`}>
                                                            {asg.score?.toFixed(2) ?? '-'}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-xs text-slate-400 italic">No hay tareas calificadas en esta categoría.</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <h5 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-1">
                                <InformationCircleIcon className="w-4 h-4" />
                                Fórmula Aplicada
                            </h5>
                            <p className="text-xs text-blue-700 leading-relaxed font-mono">
                                Nota = ({breakdown.categories
                                    .filter(c => c.average !== null)
                                    .map(c => `(${c.average?.toFixed(2)} * ${c.weight}%)`)
                                    .join(' + ')}) / {breakdown.categories.filter(c => c.average !== null).reduce((sum, c) => sum + c.weight, 0)}%
                            </p>
                            <p className="text-[10px] text-blue-500 mt-2 italic">
                                * Las categorías sin calificaciones no computan en la media ponderada final.
                            </p>
                        </div>
                    </div>
                )}

                {period.id === 'final' && (
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                         <h5 className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-1">
                            <InformationCircleIcon className="w-4 h-4" />
                            Cálculo de Nota Final del Curso
                        </h5>
                        <p className="text-xs text-amber-700 leading-relaxed">
                            La nota final se calcula promediando las notas de cada evaluación según los pesos configurados en Ajustes.
                        </p>
                        <div className="mt-3 space-y-2">
                            {academicConfiguration.evaluationPeriods.map(p => {
                                const weight = academicConfiguration.evaluationPeriodWeights?.[p.id] ?? 0;
                                return (
                                    <div key={p.id} className="flex justify-between text-xs">
                                        <span className="text-amber-600">{p.name} ({weight}%)</span>
                                        <span className="font-bold text-amber-800">Peso: {weight}%</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors text-sm font-medium"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default GradeBreakdownModal;
