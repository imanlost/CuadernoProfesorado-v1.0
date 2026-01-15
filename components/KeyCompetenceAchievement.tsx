
import React, { useMemo, useState } from 'react';
import type { ClassData, SpecificCompetence, KeyCompetence, EvaluationCriterion, AcademicConfiguration, Student } from '../types';
import { calculateStudentKeyCompetenceGrades, calculateStudentCompetenceGrades } from '../services/gradeCalculations';
import DrilldownModal, { DrilldownData } from './DrilldownModal';

interface KeyCompetenceAchievementProps {
  classData: ClassData;
  competences: SpecificCompetence[];
  keyCompetences: KeyCompetence[];
  criteria: EvaluationCriterion[];
  academicConfiguration: AcademicConfiguration;
}

const getGradeStyleClasses = (grade: number | null) => {
    if (grade === null || grade === undefined) {
        return { bg: 'bg-transparent', text: 'text-slate-500' };
    }
    if (grade < 5) {
        return { bg: 'bg-red-100', text: 'text-red-800' };
    }
    if (grade < 7) {
        return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
    }
    return { bg: 'bg-green-100', text: 'text-green-800' };
};

const KeyCompetenceAchievement: React.FC<KeyCompetenceAchievementProps> = ({ classData, competences, keyCompetences, criteria, academicConfiguration }) => {
    const [selectedPeriodId, setSelectedPeriodId] = useState<string>('all');
    const { evaluationPeriods } = academicConfiguration;
    const [drilldownData, setDrilldownData] = useState<DrilldownData | null>(null);
    
    const studentKeyCompetenceGrades = useMemo(() => {
        const studentGrades = new Map<string, Map<string, number | null>>();
        for (const student of classData.students) {
            studentGrades.set(student.id, calculateStudentKeyCompetenceGrades(student.id, classData, criteria, competences, keyCompetences, selectedPeriodId === 'all' ? undefined : selectedPeriodId));
        }
        return studentGrades;
    }, [classData, criteria, competences, keyCompetences, selectedPeriodId]);
    
    const classAverageGrades = useMemo(() => {
        const averages = new Map<string, number | null>();
        for (const keyCompetence of keyCompetences) {
            const studentGrades = classData.students.map(s => studentKeyCompetenceGrades.get(s.id)?.get(keyCompetence.id)).filter((g): g is number => g !== null && g !== undefined);
            if (studentGrades.length === 0) {
                averages.set(keyCompetence.id, null);
            } else {
                const sum = studentGrades.reduce((acc, grade) => acc + grade, 0);
                averages.set(keyCompetence.id, sum / studentGrades.length);
            }
        }
        return averages;
    }, [keyCompetences, classData.students, studentKeyCompetenceGrades]);

    const handleCellClick = (student: Student, keyCompetence: KeyCompetence) => {
        const finalGrade = studentKeyCompetenceGrades.get(student.id)?.get(keyCompetence.id) ?? null;
    
        const specificCompetencesForKeyComp = competences.filter(sc => 
            (sc.keyCompetenceDescriptorIds || []).some(descId => 
                (keyCompetence.descriptors || []).some(desc => desc.id === descId)
            )
        );
    
        const studentScGrades = calculateStudentCompetenceGrades(student.id, classData, criteria, specificCompetencesForKeyComp, selectedPeriodId === 'all' ? undefined : selectedPeriodId);
    
        const items = specificCompetencesForKeyComp.map(sc => ({
            name: `Comp. Específica ${sc.code}`,
            grade: studentScGrades.get(sc.id) ?? null,
        })).filter(item => item.grade !== null);
    
        setDrilldownData({
            studentName: student.name,
            elementName: `Competencia Clave ${keyCompetence.code}: ${keyCompetence.description}`,
            items: items,
            finalGrade: finalGrade,
        });
    };

    return (
        <div className="overflow-hidden">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-800">Grado de Consecución de Competencias Clave</h2>
                <div>
                    <select
                        value={selectedPeriodId}
                        onChange={(e) => setSelectedPeriodId(e.target.value)}
                        className="p-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                        <option value="all">Curso Completo</option>
                        {evaluationPeriods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-100 sticky top-0 z-20">
                        <tr>
                            <th scope="col" className="px-6 py-3 font-semibold sticky left-0 bg-slate-100 z-30 w-52">Alumn@</th>
                            {keyCompetences.map(kc => (
                                <th key={kc.id} scope="col" className="px-3 py-3 font-semibold min-w-[100px] text-center" title={kc.description}>
                                    {kc.code}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {classData.students.map((student, index) => (
                            <tr key={student.id} className="bg-white border-b border-slate-200/80 hover:bg-slate-50/50">
                                <td className="px-6 py-3 font-medium text-slate-900 sticky left-0 bg-white hover:bg-slate-50/50 z-10 w-52 flex items-center gap-2">
                                    <span className="text-xs text-slate-400 font-mono w-5 text-right">{index + 1}</span>
                                    <span>{student.name}</span>
                                </td>
                                {keyCompetences.map(kc => {
                                    const grade = studentKeyCompetenceGrades.get(student.id)?.get(kc.id) ?? null;
                                    const style = getGradeStyleClasses(grade);
                                    return (
                                        <td key={kc.id} className={`px-3 py-2 text-center font-bold text-base cursor-pointer ${style.bg} ${style.text}`} onClick={() => handleCellClick(student, kc)}>
                                            {grade !== null ? grade.toFixed(2) : '-'}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-slate-100 border-t-2 border-slate-300 sticky bottom-0">
                            <td className="px-6 py-3 font-bold text-slate-800 sticky left-0 bg-slate-100 z-10 w-52">Media de la Clase</td>
                            {keyCompetences.map(kc => {
                                const avgGrade = classAverageGrades.get(kc.id) ?? null;
                                const style = getGradeStyleClasses(avgGrade);
                                return (
                                    <td key={kc.id} className={`px-3 py-2 text-center font-bold text-base ${style.bg} ${style.text}`}>
                                        {avgGrade !== null ? avgGrade.toFixed(2) : '-'}
                                    </td>
                                );
                            })}
                        </tr>
                    </tfoot>
                </table>
            </div>
            <DrilldownModal isOpen={!!drilldownData} onClose={() => setDrilldownData(null)} data={drilldownData} />
        </div>
    );
};

export default KeyCompetenceAchievement;
