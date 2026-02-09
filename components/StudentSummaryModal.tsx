
import React, { useState, useMemo } from 'react';
import Modal from './Modal';
import type { Student, ClassData, EvaluationPeriod, Assignment, EvaluationCriterion, SpecificCompetence, KeyCompetence, AcademicConfiguration, Category } from '../types';
import AcneaeTag from './AcneaeTag';
import { 
    calculateOverallFinalGradeForStudent, 
    calculateEvaluationPeriodGradeForStudent, 
    calculateAssignmentScoresForStudent,
    calculateStudentKeyCompetenceGrades,
    calculateStudentCompetenceGrades,
    calculateStudentCriterionGrades,
    getGradeColorClass
} from '../services/gradeCalculations';
import { ChevronDownIcon, ChevronRightIcon, ClipboardDocumentIcon } from './Icons';

interface StudentSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: Student;
    classData: ClassData;
    academicConfiguration: AcademicConfiguration;
    criteria: EvaluationCriterion[];
    specificCompetences: SpecificCompetence[];
    keyCompetences: KeyCompetence[];
}

const StudentSummaryModal: React.FC<StudentSummaryModalProps> = ({ 
    isOpen, onClose, student, classData, academicConfiguration, criteria, specificCompetences, keyCompetences 
}) => {
    const [activeTab, setActiveTab] = useState<'evolution' | 'competences' | 'criteria'>('evolution');

    const finalGradeData = useMemo(() => 
        calculateOverallFinalGradeForStudent(student.id, classData, academicConfiguration),
    [student.id, classData, academicConfiguration]);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'evolution':
                return <EvolutionTab student={student} classData={classData} academicConfiguration={academicConfiguration} />;
            case 'competences':
                return <CompetencesTab 
                    student={student} 
                    classData={classData} 
                    criteria={criteria} 
                    specificCompetences={specificCompetences} 
                    keyCompetences={keyCompetences} 
                    academicConfiguration={academicConfiguration}
                />;
            case 'criteria':
                return <CriteriaTab student={student} classData={classData} criteria={criteria} specificCompetences={specificCompetences} academicConfiguration={academicConfiguration} />;
            default:
                return null;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Ficha del/la Alumn@" size="4xl">
            <div className="flex flex-col h-full max-h-[80vh]">
                {/* Header */}
                <div className="flex justify-between items-start mb-6 pb-4 border-b">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-2xl font-bold text-slate-800">{student.name}</h2>
                            <AcneaeTag tags={student.acneae} />
                        </div>
                        <div className="flex gap-2 text-sm text-slate-500">
                            {student.acneae.length > 0 && <span>Medidas: {student.acneae.join(', ')}</span>}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-slate-500 uppercase tracking-wide font-semibold">Nota Final Curso</p>
                        <div className={`text-3xl font-extrabold px-3 py-1 rounded-lg inline-block mt-1 ${finalGradeData.styleClasses}`}>
                            {finalGradeData.grade}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg mb-6 flex-shrink-0">
                    <TabButton label="Evolución y Calificaciones" isActive={activeTab === 'evolution'} onClick={() => setActiveTab('evolution')} />
                    <TabButton label="Perfil Competencial" isActive={activeTab === 'competences'} onClick={() => setActiveTab('competences')} />
                    <TabButton label="Semáforo de Criterios" isActive={activeTab === 'criteria'} onClick={() => setActiveTab('criteria')} />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto min-h-0 pr-2">
                    {renderTabContent()}
                </div>
            </div>
        </Modal>
    );
};

const TabButton = ({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${
            isActive ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
        }`}
    >
        {label}
    </button>
);

// --- Evolution Tab ---

interface EvolutionTabProps {
    student: Student;
    classData: ClassData;
    academicConfiguration: AcademicConfiguration;
}

const EvolutionTab: React.FC<EvolutionTabProps> = ({ student, classData, academicConfiguration }) => {
    const { evaluationPeriods } = academicConfiguration;

    return (
        <div className="space-y-4">
            {evaluationPeriods.map(period => (
                <PeriodCard key={period.id} period={period} student={student} classData={classData} academicConfiguration={academicConfiguration} />
            ))}
        </div>
    );
};

interface PeriodCardProps {
    period: EvaluationPeriod;
    student: Student;
    classData: ClassData;
    academicConfiguration: AcademicConfiguration;
}

const PeriodCard: React.FC<PeriodCardProps> = ({ period, student, classData, academicConfiguration }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const periodGrade = useMemo(() => 
        calculateEvaluationPeriodGradeForStudent(student.id, classData, period.id, academicConfiguration.gradeScale),
    [student.id, classData, period.id, academicConfiguration.gradeScale]);

    const categoriesInPeriod = useMemo(() => 
        classData.categories.filter(c => c.evaluationPeriodId === period.id),
    [classData.categories, period.id]);

    const assignments = useMemo(() => 
        classData.assignments.filter(a => a.evaluationPeriodId === period.id),
    [classData.assignments, period.id]);

    const assignmentScores = useMemo(() => 
        calculateAssignmentScoresForStudent(student.id, assignments, classData.grades),
    [student.id, assignments, classData.grades]);

    return (
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <div 
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-full bg-slate-100 text-slate-500`}>
                        {isExpanded ? <ChevronDownIcon className="w-5 h-5" /> : <ChevronRightIcon className="w-5 h-5" />}
                    </div>
                    <h3 className="font-bold text-lg text-slate-800">{period.name}</h3>
                </div>
                <div className={`font-bold text-xl px-3 py-1 rounded-md ${periodGrade.styleClasses}`}>
                    {periodGrade.grade?.toFixed(2) ?? '-'}
                </div>
            </div>
            
            {isExpanded && (
                <div className="bg-slate-50 border-t border-slate-100 p-4">
                    {categoriesInPeriod.length === 0 ? (
                        <p className="text-slate-500 italic text-sm">No hay categorías en este periodo.</p>
                    ) : (
                        <div className="space-y-4">
                            {categoriesInPeriod.map(category => {
                                const catAssignments = assignments.filter(a => a.categoryId === category.id);
                                if (catAssignments.length === 0) return null;

                                return (
                                    <div key={category.id} className="border border-slate-200 rounded-lg bg-white overflow-hidden">
                                        <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 flex justify-between items-center">
                                            <span className="font-semibold text-sm text-slate-700">{category.name} <span className="text-slate-500 text-xs font-normal">({category.weight}%)</span></span>
                                            {category.type === 'recovery' && <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">RECUPERACIÓN</span>}
                                        </div>
                                        <div className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {catAssignments.map(assignment => {
                                                const score = assignmentScores.get(assignment.id);
                                                return (
                                                    <div key={assignment.id} className="flex justify-between items-center p-2 rounded hover:bg-slate-50 border border-slate-100">
                                                        <div className="flex-1 min-w-0 pr-2">
                                                            <p className="text-sm font-medium text-slate-800 truncate flex items-center gap-1.5">
                                                                <ClipboardDocumentIcon className="w-3 h-3 text-slate-400"/>
                                                                {assignment.name}
                                                            </p>
                                                            <p className="text-[10px] text-slate-500 ml-4">
                                                                {assignment.date ? new Date(assignment.date).toLocaleDateString() : 'Sin fecha'}
                                                            </p>
                                                        </div>
                                                        <span className={`text-sm font-bold px-2 py-0.5 rounded ${getGradeColorClass(score ?? null, academicConfiguration.gradeScale)}`}>
                                                            {score?.toFixed(2) ?? '-'}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- Competences Tab ---

interface CompetencesTabProps {
    student: Student;
    classData: ClassData;
    criteria: EvaluationCriterion[];
    specificCompetences: SpecificCompetence[];
    keyCompetences: KeyCompetence[];
    academicConfiguration: AcademicConfiguration;
}

const CompetencesTab: React.FC<CompetencesTabProps> = ({ student, classData, criteria, specificCompetences, keyCompetences, academicConfiguration }) => {
    
    const kcGrades = useMemo(() => 
        calculateStudentKeyCompetenceGrades(student.id, classData, criteria, specificCompetences, keyCompetences),
    [student.id, classData, criteria, specificCompetences, keyCompetences]);

    const scGrades = useMemo(() => 
        calculateStudentCompetenceGrades(student.id, classData, criteria, specificCompetences),
    [student.id, classData, criteria, specificCompetences]);

    return (
        <div className="space-y-8">
            {/* Key Competences */}
            <div>
                <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
                    Competencias Clave
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {keyCompetences.map(kc => {
                        const grade = kcGrades.get(kc.id);
                        const colorClass = getGradeColorClass(grade ?? null, academicConfiguration.gradeScale);
                        return (
                            <div key={kc.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-slate-700 text-lg">{kc.code}</span>
                                    <span className={`font-bold text-lg px-2 py-0.5 rounded ${colorClass}`}>
                                        {grade?.toFixed(2) ?? '-'}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-2" title={kc.description}>{kc.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Specific Competences */}
            <div>
                <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                    Competencias Específicas
                </h3>
                <div className="space-y-3">
                    {specificCompetences.map(sc => {
                        const grade = scGrades.get(sc.id);
                        const colorClass = getGradeColorClass(grade ?? null, academicConfiguration.gradeScale);
                        return (
                            <div key={sc.id} className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-700">{sc.code}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 mt-1">{sc.description}</p>
                                </div>
                                <div className="flex-shrink-0 w-16 text-right">
                                    <span className={`font-bold text-lg px-2 py-1 rounded ${colorClass}`}>
                                        {grade?.toFixed(2) ?? '-'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// --- Criteria Tab ---

interface CriteriaTabProps {
    student: Student;
    classData: ClassData;
    criteria: EvaluationCriterion[];
    specificCompetences: SpecificCompetence[];
    academicConfiguration: AcademicConfiguration;
}

const CriteriaTab: React.FC<CriteriaTabProps> = ({ student, classData, criteria, specificCompetences, academicConfiguration }) => {
    const grades = useMemo(() => 
        calculateStudentCriterionGrades(student.id, classData, criteria),
    [student.id, classData, criteria]);

    // Group criteria by Specific Competence for better organization
    const groupedCriteria = useMemo(() => {
        const groups = new Map<string, EvaluationCriterion[]>();
        criteria.forEach(c => {
            if (!groups.has(c.competenceId)) groups.set(c.competenceId, []);
            groups.get(c.competenceId)!.push(c);
        });
        return groups;
    }, [criteria]);

    return (
        <div className="space-y-6">
            {specificCompetences.map(sc => {
                const scCriteria = groupedCriteria.get(sc.id) || [];
                if (scCriteria.length === 0) return null;

                return (
                    <div key={sc.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                        <div className="bg-slate-50 p-3 border-b border-slate-200">
                            <h4 className="font-bold text-slate-700">{sc.code} <span className="font-normal text-slate-500 text-sm ml-2">- {sc.description}</span></h4>
                        </div>
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {scCriteria.map(criterion => {
                                const grade = grades.get(criterion.id);
                                const colorClass = getGradeColorClass(grade ?? null, academicConfiguration.gradeScale);
                                return (
                                    <div key={criterion.id} className="flex items-start justify-between p-2 rounded border border-slate-100 hover:border-slate-300 transition-colors">
                                        <div className="flex-1 pr-2">
                                            <span className="font-bold text-xs text-slate-500 block mb-1">{criterion.code}</span>
                                            <p className="text-sm text-slate-700 leading-tight" title={criterion.description}>
                                                {criterion.description}
                                            </p>
                                        </div>
                                        <span className={`font-bold text-sm px-2 py-1 rounded-full flex-shrink-0 ${colorClass}`}>
                                            {grade?.toFixed(1) ?? '-'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default StudentSummaryModal;
