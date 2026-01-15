
import React, { useMemo, useState } from 'react';
import type { ClassData, SpecificCompetence, KeyCompetence, EvaluationCriterion, AcademicConfiguration, Student } from '../types';
import { calculateStudentCompetenceGrades, calculateStudentCriterionGrades } from '../services/gradeCalculations';
import DrilldownModal, { DrilldownData } from './DrilldownModal';

interface SpecificCompetenceAchievementProps {
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

const SpecificCompetenceAchievement: React.FC<SpecificCompetenceAchievementProps> = ({ classData, competences, keyCompetences, criteria, academicConfiguration }) => {
    const [selectedPeriodId, setSelectedPeriodId] = useState<string>('all');
    const { evaluationPeriods } = academicConfiguration;
    const [drilldownData, setDrilldownData] = useState<DrilldownData | null>(null);

    const studentCompetenceGrades = useMemo(() => {
        const studentGrades = new Map<string, Map<string, number | null>>();
        for (const student of classData.students) {
            studentGrades.set(student.id, calculateStudentCompetenceGrades(student.id, classData, criteria, competences, selectedPeriodId === 'all' ? undefined : selectedPeriodId));
        }
        return studentGrades;
    }, [classData, criteria, competences, selectedPeriodId]);

    const descriptorToKeyCompetenceMap = useMemo(() => {
        const map = new Map<string, KeyCompetence>();
        for (const kc of keyCompetences) {
            for (const desc of (kc.descriptors || [])) {
                map.set(desc.id, kc);
            }
        }
        return map;
    }, [keyCompetences]);

    const classAverageGrades = useMemo(() => {
        const averages = new Map<string, number | null>();
        for (const competence of competences) {
            const studentGrades = classData.students.map(s => studentCompetenceGrades.get(s.id)?.get(competence.id)).filter(g => g !== null && g !== undefined) as number[];
            if (studentGrades.length === 0) {
                averages.set(competence.id, null);
            } else {
                const sum = studentGrades.reduce((acc, grade) => acc + grade, 0);
                averages.set(competence.id, sum / studentGrades.length);
            }
        }
        return averages;
    }, [competences, classData.students, studentCompetenceGrades]);
    
    const handleCellClick = (student: Student, competence: SpecificCompetence) => {
        const finalGrade = studentCompetenceGrades.get(student.id)?.get(competence.id) ?? null;
    
        const criteriaForCompetence = criteria.filter(c => c.competenceId === competence.id);
        const studentCriterionGrades = calculateStudentCriterionGrades(student.id, classData, criteriaForCompetence, selectedPeriodId === 'all' ? undefined : selectedPeriodId);
    
        const items = criteriaForCompetence.map(criterion => ({
            name: `Criterio ${criterion.code}`,
            grade: studentCriterionGrades.get(criterion.id) ?? null,
        })).filter(item => item.grade !== null);
    
        setDrilldownData({
            studentName: student.name,
            elementName: `Competencia Específica ${competence.code}: ${competence.description}`,
            items: items,
            finalGrade: finalGrade,
        });
    };

    return (
        <div className="overflow-hidden">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-800">Grado de Consecución de Competencias Específicas</h2>
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
                            {competences.map(competence => (
                                <th key={competence.id} scope="col" className="px-3 py-3 font-semibold min-w-[150px] text-center" title={competence.description}>
                                    <div className="font-bold">{competence.code}</div>
                                    <div className="font-normal text-slate-500">{
                                        Array.from(new Set(
                                            (competence.keyCompetenceDescriptorIds || [])
                                                .map(descId => descriptorToKeyCompetenceMap.get(descId)?.code)
                                                .filter((code): code is string => !!code)
                                        )).join(', ')
                                    }</div>
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
                                {competences.map(competence => {
                                    const grade = studentCompetenceGrades.get(student.id)?.get(competence.id) ?? null;
                                    const style = getGradeStyleClasses(grade);
                                    return (
                                        <td key={competence.id} className={`px-3 py-2 text-center font-bold text-base cursor-pointer ${style.bg} ${style.text}`} onClick={() => handleCellClick(student, competence)}>
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
                            {competences.map(competence => {
                                const avgGrade = classAverageGrades.get(competence.id) ?? null;
                                const style = getGradeStyleClasses(avgGrade);
                                return (
                                    <td key={competence.id} className={`px-3 py-2 text-center font-bold text-base ${style.bg} ${style.text}`}>
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

export default SpecificCompetenceAchievement;
