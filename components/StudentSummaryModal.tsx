
import React, { useState, useMemo } from 'react';
import Modal from './Modal';
import type { Student, StudentNote, ClassData, EvaluationPeriod, Assignment, EvaluationCriterion, SpecificCompetence, KeyCompetence, AcademicConfiguration, Category } from '../types';
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
import { ChevronDownIcon, ChevronRightIcon, ChevronLeftIcon, ClipboardDocumentIcon, PlusIcon, TrashIcon, StarIcon, ExclamationTriangleIcon } from './Icons';

interface StudentSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: Student;
    classData: ClassData;
    academicConfiguration: AcademicConfiguration;
    criteria: EvaluationCriterion[];
    specificCompetences: SpecificCompetence[];
    keyCompetences: KeyCompetence[];
    onStudentChange?: (student: Student) => void;
    onStudentUpdate?: (updatedStudent: Student) => void;
}

const StudentSummaryModal: React.FC<StudentSummaryModalProps> = ({ 
    isOpen, onClose, student, classData, academicConfiguration, criteria, specificCompetences, keyCompetences, onStudentChange, onStudentUpdate
}) => {
    const [activeTab, setActiveTab] = useState<'evolution' | 'competences' | 'criteria' | 'notes'>('evolution');

    const finalGradeData = useMemo(() => 
        calculateOverallFinalGradeForStudent(student.id, classData, academicConfiguration),
    [student.id, classData, academicConfiguration]);

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
            case 'notes':
                return <NotesTab student={student} onUpdateStudent={onStudentUpdate} />;
            default:
                return null;
        }
    };

    const hasImportantNotes = (student.notes || []).some(n => n.important);
    const latestImportantNote = (student.notes || []).filter(n => n.important).sort((a, b) => b.date.localeCompare(a.date))[0];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Ficha del/la Alumn@" size="4xl">
            <div className="flex flex-col h-full max-h-[80vh]">
                {/* Header */}
                <div className="flex justify-between items-start mb-6 pb-4 border-b">
                    <div className="flex-1 mr-4">
                        <div className="flex items-center gap-3 mb-1">
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
                                    className="bg-transparent border-none text-xl font-bold text-slate-800 focus:ring-0 cursor-pointer py-1 pr-8 appearance-none hover:bg-white hover:shadow-sm rounded-md transition-all"
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
                            <AcneaeTag tags={student.acneae} />
                        </div>
                        <div className="flex gap-2 text-sm text-slate-500 ml-1">
                            {student.acneae.length > 0 && <span>Medidas: {student.acneae.join(', ')}</span>}
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <p className="text-sm text-slate-500 uppercase tracking-wide font-semibold">Nota Final Curso</p>
                        <div className={`text-3xl font-extrabold px-3 py-1 rounded-lg inline-block mt-1 ${finalGradeData.styleClasses}`}>
                            {finalGradeData.grade}
                        </div>
                    </div>
                </div>

                {hasImportantNotes && latestImportantNote && (
                    <div className="mb-4 flex items-start gap-2 bg-amber-50 border border-amber-300 rounded-lg px-3 py-2">
                        <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                                Aviso importante · {formatNoteDate(latestImportantNote.date)}
                            </p>
                            <p className="text-sm text-amber-900 whitespace-pre-wrap break-words leading-snug mt-0.5 max-h-20 overflow-y-auto">
                                {latestImportantNote.text}
                            </p>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg mb-6 flex-shrink-0">
                    <TabButton label="Evolución y Calificaciones" isActive={activeTab === 'evolution'} onClick={() => setActiveTab('evolution')} />
                    <TabButton label="Perfil Competencial" isActive={activeTab === 'competences'} onClick={() => setActiveTab('competences')} />
                    <TabButton label="Semáforo de Criterios" isActive={activeTab === 'criteria'} onClick={() => setActiveTab('criteria')} />
                    <TabButton label={hasImportantNotes ? "Anotaciones ⚠" : "Anotaciones"} isActive={activeTab === 'notes'} onClick={() => setActiveTab('notes')} />
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
        calculateStudentKeyCompetenceGrades(student.id, classData, criteria, specificCompetences, keyCompetences, academicConfiguration),
    [student.id, classData, criteria, specificCompetences, keyCompetences, academicConfiguration]);

    const scGrades = useMemo(() => 
        calculateStudentCompetenceGrades(student.id, classData, criteria, specificCompetences, academicConfiguration),
    [student.id, classData, criteria, specificCompetences, academicConfiguration]);

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
        calculateStudentCriterionGrades(student.id, classData, criteria, academicConfiguration),
    [student.id, classData, criteria, academicConfiguration]);

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

// --- Anotaciones Tab ---

const formatNoteDate = (iso: string): string => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-').map(Number);
    const date = new Date(y || 2000, (m || 1) - 1, d || 1);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
};

const todayLocalISO = (): string => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

interface NotesTabProps {
    student: Student;
    onUpdateStudent?: (updatedStudent: Student) => void;
}

const NotesTab: React.FC<NotesTabProps> = ({ student, onUpdateStudent }) => {
    const notes = student.notes || [];
    const [draft, setDraft] = useState('');
    const [draftImportant, setDraftImportant] = useState(false);

    const persist = (nextNotes: StudentNote[]) => {
        if (onUpdateStudent) {
            onUpdateStudent({ ...student, notes: nextNotes });
        }
    };

    const addNote = () => {
        const text = draft.trim();
        if (!text) return;
        const newNote: StudentNote = {
            id: `n-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
            date: todayLocalISO(),
            text,
            important: draftImportant,
        };
        persist([...notes, newNote]);
        setDraft('');
        setDraftImportant(false);
    };

    const toggleImportant = (noteId: string) => {
        persist(notes.map(n => n.id === noteId ? { ...n, important: !n.important } : n));
    };

    const deleteNote = (noteId: string) => {
        persist(notes.filter(n => n.id !== noteId));
    };

    const sortedNotes = useMemo(() =>
        [...notes].sort((a, b) => {
            if (a.important !== b.important) return a.important ? -1 : 1;
            return b.date.localeCompare(a.date);
        }),
    [notes]);

    return (
        <div className="space-y-4">
            {/* Nueva anotación */}
            <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
                <p className="text-sm font-semibold text-slate-700 mb-2">Nueva anotación</p>
                <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Escribe aquí información sobre el alumno/a: casos especiales, reuniones, acuerdos, informaciones de tutores/as o familias..."
                    rows={3}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                />
                <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
                    <label className="flex items-center gap-1.5 text-sm text-slate-600 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={draftImportant}
                            onChange={(e) => setDraftImportant(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                        />
                        <StarIcon className={`w-4 h-4 ${draftImportant ? 'text-amber-500' : 'text-slate-400'}`} />
                        Marcar como aviso importante
                    </label>
                    <button
                        onClick={addNote}
                        disabled={!draft.trim()}
                        className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-semibold rounded-md px-3 py-1.5 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Añadir anotación
                    </button>
                </div>
            </div>

            {/* Historial */}
            {sortedNotes.length === 0 ? (
                <p className="text-sm text-slate-400 italic px-1">
                    No hay anotaciones para este alumno/a todavía.
                </p>
            ) : (
                <div className="space-y-2">
                    {sortedNotes.map(note => (
                        <div
                            key={note.id}
                            className={`rounded-lg border p-3 flex items-start gap-2 ${note.important
                                ? 'bg-amber-50 border-amber-300'
                                : 'bg-white border-slate-200'
                            }`}
                        >
                            <button
                                onClick={() => toggleImportant(note.id)}
                                title={note.important ? 'Quitar aviso importante' : 'Marcar como aviso importante'}
                                className={`flex-shrink-0 p-1 rounded-md transition-colors ${note.important
                                    ? 'text-amber-500 hover:bg-amber-100'
                                    : 'text-slate-300 hover:text-amber-500 hover:bg-slate-100'
                                }`}
                            >
                                <StarIcon className="w-5 h-5" />
                            </button>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`text-xs font-semibold ${note.important ? 'text-amber-700' : 'text-slate-500'}`}>
                                        {formatNoteDate(note.date)}
                                    </span>
                                    {note.important && (
                                        <span className="text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded uppercase tracking-wide">
                                            Importante
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-800 whitespace-pre-wrap break-words leading-snug mt-0.5">
                                    {note.text}
                                </p>
                            </div>
                            <button
                                onClick={() => deleteNote(note.id)}
                                title="Eliminar anotación"
                                className="flex-shrink-0 p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentSummaryModal;
