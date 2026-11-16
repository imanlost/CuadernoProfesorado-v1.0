
import React from 'react';
import type { Student, ClassData, AcademicConfiguration, EvaluationPeriod } from '../types';
import { calculateDetailedPeriodGradeBreakdown, getGradeColorClass, calculateDetailedFinalGradeBreakdown } from '../services/gradeCalculations';
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

    const finalBreakdown = React.useMemo(() => {
        if (period.id !== 'final') return null;
        return calculateDetailedFinalGradeBreakdown(student.id, classData, academicConfiguration);
    }, [student.id, classData, period.id, academicConfiguration]);

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

    const finalCourseGrade = finalBreakdown ? finalBreakdown.finalGrade : null;

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

                {period.id === 'final' && finalBreakdown && (
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                         <h5 className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-1">
                            <InformationCircleIcon className="w-4 h-4" />
                            Cálculo de Nota Final del Curso
                        </h5>
                        <p className="text-xs text-amber-700 leading-relaxed">
                            Media ponderada de las evaluaciones con nota, según los pesos configurados en Ajustes. Las evaluaciones sin calificar no computan.
                        </p>
                        <div className="mt-3 overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="text-amber-700 border-b border-amber-200">
                                        <th className="text-left py-1 font-semibold">Evaluación</th>
                                        <th className="text-center py-1 font-semibold">Nota</th>
                                        <th className="text-center py-1 font-semibold">Peso</th>
                                        <th className="text-right py-1 font-semibold">Aporta</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {finalBreakdown.periods.map(p => {
                                        const computa = p.effectiveGrade !== null && p.weight !== null;
                                        return (
                                            <tr key={p.id} className="border-b border-amber-100 last:border-0">
                                                <td className="py-1 text-amber-800">
                                                    {p.name}
                                                    {p.recovered && (
                                                        <span className="ml-1 text-[10px] font-bold bg-amber-200 text-amber-900 px-1 rounded">RECUP.</span>
                                                    )}
                                                </td>
                                                <td className="py-1 text-center font-mono text-amber-900">
                                                    {p.effectiveGrade !== null ? p.effectiveGrade.toFixed(2) : '—'}
                                                </td>
                                                <td className="py-1 text-center text-amber-700">
                                                    {p.weight !== null ? `${p.weight}%` : '—'}
                                                </td>
                                                <td className="py-1 text-right font-mono font-bold text-amber-900">
                                                    {computa ? ((p.effectiveGrade as number) * (p.weight as number)).toFixed(2) : '—'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {finalBreakdown.finalGrade !== null ? (
                            <p className="mt-3 text-xs font-mono text-amber-800 bg-amber-100/70 rounded p-2 leading-relaxed break-words">
                                {'Nota = ['}
                                {finalBreakdown.periods
                                    .filter(p => p.effectiveGrade !== null && p.weight !== null)
                                    .map(p => `(${(p.effectiveGrade as number).toFixed(2)} × ${p.weight})`)
                                    .join(' + ')}
                                {`] / ${finalBreakdown.totalWeight} = ${finalBreakdown.finalGrade.toFixed(2)}`}
                            </p>
                        ) : (
                            <p className="mt-3 text-xs italic text-amber-700">
                                No hay evaluaciones con nota y peso configurados.
                            </p>
                        )}
                        <p className="mt-2 text-[10px] text-amber-600 italic">
                            «Aporta» es la nota de la evaluación multiplicada por su peso. La suma de las aportaciones se divide entre la suma de los pesos aplicados.
                        </p>
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
