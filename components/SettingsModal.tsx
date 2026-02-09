
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import Modal from './Modal';
import { UserGroupIcon, AcademicCapIcon, ArrowDownTrayIcon, PencilIcon, TrashIcon, PlusIcon, BookOpenIcon, ClockIcon, CalendarDaysIcon, ListBulletIcon, ArrowUpIcon, ArrowDownIcon, BeakerIcon } from './Icons';
import type { ClassData, Course, Student, KeyCompetence, SpecificCompetence, EvaluationCriterion, JournalEntry, AcademicConfiguration, Holiday, EvaluationPeriod, BasicKnowledge, ProgrammingUnit, EvaluationTool, GradeScaleRule } from '../types';
import { ACNEAE_TAGS } from '../constants';
import ClassModal from './ClassModal';
import BulkAddStudentModal from './BulkAddStudentModal';
import CurriculumManager from './CurriculumManager';
import ProgrammingManager from './ProgrammingManager';
import EvaluationToolManager from './EvaluationToolManager';


interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenExportModal: () => void;
    courses: Course[];
    setCourses: (updater: React.SetStateAction<Course[]>) => void;
    classes: ClassData[];
    setClasses: (updater: React.SetStateAction<ClassData[]>) => void;
    keyCompetences: KeyCompetence[];
    setKeyCompetences: (updater: React.SetStateAction<KeyCompetence[]>) => void;
    specificCompetences: SpecificCompetence[];
    setSpecificCompetences: (updater: React.SetStateAction<SpecificCompetence[]>) => void;
    evaluationCriteria: EvaluationCriterion[];
    setEvaluationCriteria: (updater: React.SetStateAction<EvaluationCriterion[]>) => void;
    journalEntries: JournalEntry[];
    setJournalEntries: (updater: React.SetStateAction<JournalEntry[]>) => void;
    importDatabase: (buffer: ArrayBuffer) => Promise<void>;
    exportDatabase: () => Uint8Array | null;
    resetDatabase: () => Promise<void>;
    basicKnowledge: BasicKnowledge[];
    setBasicKnowledge: (updater: React.SetStateAction<BasicKnowledge[]>) => void;
    academicConfiguration: AcademicConfiguration;
    setAcademicConfiguration: (updater: React.SetStateAction<AcademicConfiguration>) => void;
    programmingUnits: ProgrammingUnit[];
    setProgrammingUnits: (updater: (prev: ProgrammingUnit[]) => ProgrammingUnit[]) => void;
    evaluationTools: EvaluationTool[];
    setEvaluationTools: (updater: React.SetStateAction<EvaluationTool[]>) => void;
}

type SettingsView = 'classes' | 'schedule' | 'courses' | 'academicConfig' | 'curriculum' | 'planner' | 'evaluationTools' | 'backup';

const SettingsModal: React.FC<SettingsModalProps> = (props) => {
    const { isOpen, onClose, classes, setClasses, courses, setCourses, onOpenExportModal, academicConfiguration, setAcademicConfiguration, programmingUnits, setProgrammingUnits, evaluationTools, setEvaluationTools, evaluationCriteria } = props;
    const [activeView, setActiveView] = useState<SettingsView>('academicConfig');

    const renderView = () => {
        switch (activeView) {
            case 'classes':
                return <ClassManager classes={classes} setClasses={setClasses} courses={courses} />;
            case 'schedule':
                return <ScheduleManager classes={classes} setClasses={setClasses} academicConfiguration={academicConfiguration} />;
            case 'courses':
                return <CourseManager courses={courses} setCourses={setCourses} classes={classes} setClasses={setClasses} />;
             case 'academicConfig':
                return <AcademicConfigManager academicConfiguration={academicConfiguration} setAcademicConfiguration={setAcademicConfiguration} />;
            case 'curriculum':
                return <CurriculumManager {...props} />;
            case 'planner':
                return <ProgrammingManager 
                    courses={courses} 
                    units={programmingUnits} 
                    setUnits={setProgrammingUnits} 
                    criteria={props.evaluationCriteria} 
                    basicKnowledge={props.basicKnowledge} 
                    classes={classes} 
                    academicConfiguration={academicConfiguration} 
                />;
            case 'evaluationTools':
                return <EvaluationToolManager 
                    evaluationTools={evaluationTools}
                    setEvaluationTools={setEvaluationTools}
                    criteria={evaluationCriteria}
                    courses={courses}
                />;
            case 'backup':
                return <BackupManager {...props} onOpenExportModal={onOpenExportModal} />;
            default:
                return null;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Ajustes de la Aplicación" size="5xl">
            <div className="flex flex-col md:flex-row gap-8 min-h-[60vh]">
                <nav className="flex-shrink-0 md:w-56 flex flex-col">
                    <ul className="space-y-2">
                        <SettingsNavItem icon={<CalendarDaysIcon />} label="Configuración del Curso" view="academicConfig" activeView={activeView} setActiveView={setActiveView} />
                        <SettingsNavItem icon={<BookOpenIcon />} label="Cursos y Materias" view="courses" activeView={activeView} setActiveView={setActiveView} />
                        <SettingsNavItem icon={<UserGroupIcon />} label="Clases y Alumnado" view="classes" activeView={activeView} setActiveView={setActiveView} />
                        <SettingsNavItem icon={<ClockIcon />} label="Horario Semanal" view="schedule" activeView={activeView} setActiveView={setActiveView} />
                        <SettingsNavItem icon={<AcademicCapIcon />} label="Gestionar Currículo" view="curriculum" activeView={activeView} setActiveView={setActiveView} />
                        <SettingsNavItem icon={<ListBulletIcon />} label="Planificación UD" view="planner" activeView={activeView} setActiveView={setActiveView} />
                        <SettingsNavItem icon={<BeakerIcon />} label="Instrumentos Evaluación" view="evaluationTools" activeView={activeView} setActiveView={setActiveView} />
                    </ul>
                    <div className="mt-4 pt-4 border-t">
                         <SettingsNavItem icon={<ArrowDownTrayIcon />} label="Copia de Seguridad" view="backup" activeView={activeView} setActiveView={setActiveView} />
                    </div>
                </nav>
                <main className="flex-grow min-w-0 pr-2">
                    {renderView()}
                </main>
            </div>
        </Modal>
    );
};

const SettingsNavItem = ({ icon, label, view, activeView, setActiveView }: any) => (
    <li>
        <button
            onClick={() => setActiveView(view)}
            className={`w-full flex items-center p-2 rounded-lg text-left text-sm font-medium transition-colors ${
                activeView === view ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
        >
            {React.cloneElement(icon, { className: 'w-5 h-5 mr-3' })}
            {label}
        </button>
    </li>
);

// ... (ClassManager, StudentRow, AcneaeSelector, ScheduleManager, CourseManager components remain unchanged) ...
// The change is primarily in AcademicConfigManager below

const ClassManager: React.FC<{
    classes: ClassData[];
    setClasses: (updater: React.SetStateAction<ClassData[]>) => void;
    courses: Course[];
}> = ({ classes, setClasses, courses }) => {
    
    const academicClasses = useMemo(() => {
        const academicCourseIds = new Set(courses.filter(c => c.type !== 'other').map(c => c.id));
        return classes.filter(c => academicCourseIds.has(c.courseId));
    }, [classes, courses]);

    const [activeClassId, setActiveClassId] = useState(academicClasses[0]?.id || '');
    const [isClassModalOpen, setIsClassModalOpen] = useState(false);
    const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
    const [classToEdit, setClassToEdit] = useState<ClassData | null>(null);

    useEffect(() => {
        if (academicClasses.length > 0 && !academicClasses.find(c => c.id === activeClassId)) {
            setActiveClassId(academicClasses[0].id);
        } else if (academicClasses.length === 0) {
            setActiveClassId('');
        }
    }, [academicClasses, activeClassId]);

    const activeClass = classes.find((c: ClassData) => c.id === activeClassId);

    const handleStudentUpdate = (studentId: string, updatedStudent: Partial<Student>) => {
        setClasses((prevClasses: ClassData[]) => prevClasses.map(c => 
            c.id === activeClassId 
                ? { ...c, students: c.students.map(s => s.id === studentId ? { ...s, ...updatedStudent } : s) } 
                : c
        ));
    };
    
    const handleReorderStudent = (studentId: string, direction: 'up' | 'down') => {
        setClasses(prevClasses => prevClasses.map(c => {
            if (c.id !== activeClassId) return c;
            
            const students = c.students;
            const currentIndex = students.findIndex(s => s.id === studentId);
            if (currentIndex === -1) return c;

            const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
            if (newIndex < 0 || newIndex >= students.length) return c;

            const newStudents = [...students];
            const [movedStudent] = newStudents.splice(currentIndex, 1);
            newStudents.splice(newIndex, 0, movedStudent);

            return { ...c, students: newStudents };
        }));
    };

    const handleDeleteStudent = (studentId: string) => {
        if (!window.confirm('¿Seguro que quieres eliminar a este/a alumn@? Se perderán todas sus calificaciones.')) {
            return;
        }
        setClasses(prevClasses => prevClasses.map(c => {
            if (c.id === activeClassId) {
                const updatedStudents = c.students.filter(s => s.id !== studentId);
                const updatedGrades = c.grades.filter(g => g.studentId !== studentId);
                return { ...c, students: updatedStudents, grades: updatedGrades };
            }
            return c;
        }));
    };
    
    const handleSaveClass = (classData: Omit<ClassData, 'students' | 'categories' | 'assignments' | 'grades'>) => {
        if (classToEdit) {
            setClasses(prev => prev.map(c => c.id === classToEdit.id ? { ...c, ...classData } : c));
        } else {
            const newClass: ClassData = {
                ...classData,
                students: [],
                categories: [],
                assignments: [],
                grades: [],
                schedule: [],
            };
            setClasses(prev => [...prev, newClass]);
            setActiveClassId(newClass.id);
        }
    };
    
    const handleDeleteClass = (classId: string) => {
        if (window.confirm('¿Seguro que quieres eliminar esta clase? Se perderá TODA la información asociada (alumnado, tareas, calificaciones).')) {
            setClasses(prev => {
                const newClasses = prev.filter(c => c.id !== classId);
                if (activeClassId === classId) {
                    setActiveClassId(newClasses[0]?.id || '');
                }
                return newClasses;
            });
        }
    };
    
    const handleBulkAddStudents = (newStudentData: { name: string; acneae: string[] }[]) => {
        if (!activeClassId) return;

        const newStudents: Student[] = newStudentData.map((data, index) => ({
            id: `s-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`,
            name: data.name,
            acneae: data.acneae,
        }));

        if (newStudents.length > 0) {
            setClasses(prevClasses => prevClasses.map(c => 
                c.id === activeClassId 
                    ? { ...c, students: [...c.students, ...newStudents] } 
                    : c
            ));
            alert(`${newStudents.length} alumn@s importados con éxito a la clase "${activeClass?.name}".`);
        }
        setIsBulkAddModalOpen(false);
    };


    return (
        <div>
            <h3 className="text-xl font-bold text-slate-800 mb-4">Gestión de Clases y Alumnado</h3>
            <div className="flex items-center gap-2 mb-4">
                <label htmlFor="class-select" className="text-sm font-medium">Clase:</label>
                <select id="class-select" value={activeClassId} onChange={e => setActiveClassId(e.target.value)} className="p-2 border border-slate-300 rounded-lg">
                    {academicClasses.map((c: ClassData) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {activeClass && (
                    <div className="flex items-center gap-1">
                        <button onClick={() => { setClassToEdit(activeClass); setIsClassModalOpen(true); }} className="p-2 rounded-full hover:bg-slate-200" title="Editar clase"><PencilIcon className="w-4 h-4 text-slate-600"/></button>
                        <button onClick={() => handleDeleteClass(activeClass.id)} className="p-2 rounded-full hover:bg-slate-200" title="Eliminar clase"><TrashIcon className="w-4 h-4 text-red-500"/></button>
                    </div>
                )}
                 <button onClick={() => { setClassToEdit(null); setIsClassModalOpen(true); }} className="ml-auto inline-flex items-center justify-center py-2 px-3 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700">
                    <PlusIcon className="w-4 h-4 mr-1"/>
                    Añadir Clase
                </button>
            </div>
            {activeClass ? (
                <div className="border border-slate-200 rounded-lg">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="p-3 text-left font-semibold w-8">#</th>
                                <th className="p-3 text-left font-semibold">Nombre del/la Alumn@</th>
                                <th className="p-3 text-left font-semibold">Anotaciones ACNEAE</th>
                                <th className="p-3 text-right font-semibold">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeClass.students.map((student: Student, index: number) => (
                                <StudentRow 
                                    key={student.id} 
                                    student={student} 
                                    onUpdate={handleStudentUpdate} 
                                    onDelete={handleDeleteStudent}
                                    onReorder={handleReorderStudent}
                                    index={index}
                                    totalStudents={activeClass.students.length}
                                />
                            ))}
                        </tbody>
                    </table>
                     <div className="p-3 border-t bg-slate-50/50">
                        <button onClick={() => setIsBulkAddModalOpen(true)} className="w-full text-center py-2 text-sm font-semibold text-green-600 hover:bg-green-100 bg-white rounded-md border border-slate-200 shadow-sm">
                           Añadir Alumnado en Lote
                        </button>
                    </div>
                </div>
            ) : (
                <p className="text-slate-500 text-center py-8 bg-slate-50 rounded-lg">No hay clases académicas. ¡Añade una para empezar!</p>
            )}
            <ClassModal 
                isOpen={isClassModalOpen}
                onClose={() => setIsClassModalOpen(false)}
                onSave={handleSaveClass}
                classToEdit={classToEdit}
                courses={courses.filter(c => c.type !== 'other')}
            />
            <BulkAddStudentModal
                isOpen={isBulkAddModalOpen}
                onClose={() => setIsBulkAddModalOpen(false)}
                onSave={handleBulkAddStudents}
            />
        </div>
    );
};

interface AcneaeSelectorProps {
    selected: Set<string>;
    onChange: (newSelection: Set<string>) => void;
}

const AcneaeSelector: React.FC<AcneaeSelectorProps> = ({ selected, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleTagChange = (tag: string, checked: boolean) => {
        const newSelection = new Set(selected);
        if (checked) {
            newSelection.add(tag);
        } else {
            newSelection.delete(tag);
        }
        onChange(newSelection);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="px-3 py-1.5 border border-slate-300 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
                ACNEAE ({selected.size})
            </button>
            {isOpen && (
                <div className="absolute z-20 mt-1 w-64 bg-white shadow-lg border rounded-md p-2 right-0">
                    <p className="text-xs font-bold mb-2">Seleccionar Medidas</p>
                    <div className="grid grid-cols-2 gap-2">
                        {ACNEAE_TAGS.map(tag => (
                            <label key={tag} className="flex items-center space-x-2 text-xs cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selected.has(tag)}
                                    onChange={e => handleTagChange(tag, e.target.checked)}
                                    className="rounded text-blue-600 focus:ring-blue-500"
                                />
                                <span>{tag}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

interface StudentRowProps {
    student: Student;
    onUpdate: (id: string, data: Partial<Student>) => void;
    onDelete: (id: string) => void;
    onReorder: (id: string, direction: 'up' | 'down') => void;
    index: number;
    totalStudents: number;
}

const StudentRow: React.FC<StudentRowProps> = ({ student, onUpdate, onDelete, onReorder, index, totalStudents }) => {
    const [name, setName] = useState(student.name);

    const handleAcneaeChange = (newAcneae: Set<string>) => {
        onUpdate(student.id, { acneae: Array.from(newAcneae) });
    };

    return (
        <tr className="border-t">
            <td className="p-3 text-center text-slate-500">{index + 1}</td>
            <td className="p-3">
                <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    onBlur={() => onUpdate(student.id, { name })}
                    className="w-full p-1 bg-transparent rounded-md border-transparent hover:border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                />
            </td>
            <td className="p-3">
                 <AcneaeSelector selected={new Set(student.acneae)} onChange={handleAcneaeChange} />
            </td>
             <td className="p-3 text-right">
                <div className="inline-flex items-center gap-1">
                    <button onClick={() => onReorder(student.id, 'up')} disabled={index === 0} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full disabled:opacity-30 disabled:cursor-not-allowed">
                        <ArrowUpIcon className="w-4 h-4"/>
                    </button>
                     <button onClick={() => onReorder(student.id, 'down')} disabled={index === totalStudents - 1} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full disabled:opacity-30 disabled:cursor-not-allowed">
                        <ArrowDownIcon className="w-4 h-4"/>
                    </button>
                    <button onClick={() => onDelete(student.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full">
                        <TrashIcon className="w-4 h-4"/>
                    </button>
                </div>
            </td>
        </tr>
    );
};

// --- Schedule Manager ---

const ScheduleManager: React.FC<{
    classes: ClassData[];
    setClasses: (updater: React.SetStateAction<ClassData[]>) => void;
    academicConfiguration: AcademicConfiguration;
}> = ({ classes, setClasses, academicConfiguration }) => {
    const daysOfWeek = [{label: 'Lunes', value: 1}, {label: 'Martes', value: 2}, {label: 'Miércoles', value: 3}, {label: 'Jueves', value: 4}, {label: 'Viernes', value: 5}];
    const periods = academicConfiguration.periods || [];

    const handleScheduleChange = (day: number, periodIndex: number, newClassId: string) => {
        setClasses(prevClasses => {
            return prevClasses.map(c => {
                const oldSchedule = c.schedule || [];
                const hasSlot = oldSchedule.some(slot => slot.day === day && slot.periodIndex === periodIndex);

                if (c.id === newClassId) {
                    return hasSlot ? c : { ...c, schedule: [...oldSchedule, { day, periodIndex }] };
                } 
                
                if (hasSlot) {
                    return { ...c, schedule: oldSchedule.filter(slot => !(slot.day === day && slot.periodIndex === periodIndex)) };
                }

                return c;
            });
        });
    };

    const scheduleGrid = useMemo(() => {
        const grid = new Map<string, string>(); // key: "day-period", value: classId
        classes.forEach(c => {
            (c.schedule || []).forEach(slot => {
                grid.set(`${slot.day}-${slot.periodIndex}`, c.id);
            });
        });
        return grid;
    }, [classes]);

    return (
        <div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Horario Semanal de Clases</h3>
            <p className="text-sm text-slate-600 mb-4">
                Asigna cada clase a su franja horaria correspondiente. Esto se usará para generar el calendario de sesiones.
            </p>
            <div className="border border-slate-200 rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-700">
                        <tr>
                            <th className="p-2 font-semibold text-left border-b border-r">Franja Horaria</th>
                            {daysOfWeek.map(day => (
                                <th key={day.value} className="p-2 font-semibold text-center border-b border-r">{day.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {periods.map((periodName, periodIndex) => (
                            <tr key={periodIndex} className="border-t">
                                <td className="p-2 font-medium text-slate-600 border-r">{periodName}</td>
                                {daysOfWeek.map(day => {
                                    const classIdInSlot = scheduleGrid.get(`${day.value}-${periodIndex}`) || '';
                                    return (
                                        <td key={`${day.value}-${periodIndex}`} className="p-1 border-r">
                                            <select 
                                                value={classIdInSlot} 
                                                onChange={e => handleScheduleChange(day.value, periodIndex, e.target.value)}
                                                className="w-full p-2 border border-slate-200 rounded-md bg-white hover:bg-slate-50"
                                            >
                                                <option value="">-- Ninguna --</option>
                                                {classes.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// --- Course Manager ---

const CourseManager: React.FC<{
    courses: Course[];
    setCourses: (updater: React.SetStateAction<Course[]>) => void;
    classes: ClassData[];
    setClasses: (updater: React.SetStateAction<ClassData[]>) => void;
}> = ({ courses, setCourses, classes, setClasses }) => {
    const [newLevel, setNewLevel] = useState('1º ESO');
    const [newSubject, setNewSubject] = useState('');
    const [newOtherName, setNewOtherName] = useState('');

    const academicCourses = courses.filter(c => c.type !== 'other');
    const otherOccupations = courses.filter(c => c.type === 'other');
    
    const handleAddCourse = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSubject.trim() === '') return;
        const newCourse: Course = {
            id: `course-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            level: newLevel,
            subject: newSubject.trim(),
            type: 'academic',
        };
        setCourses(prev => [...prev, newCourse]);
        setNewSubject('');
    };

    const handleAddOtherOccupation = (e: React.FormEvent) => {
        e.preventDefault();
        if (newOtherName.trim() === '') return;

        const newCourse: Course = {
            id: `course-other-${Date.now()}`,
            level: 'Otro',
            subject: newOtherName.trim(),
            type: 'other'
        };

        const newClass: ClassData = {
            id: `class-other-${Date.now()}`,
            name: newOtherName.trim(),
            courseId: newCourse.id,
            students: [],
            categories: [],
            assignments: [],
            grades: [],
            schedule: [],
        };
        
        setCourses(prev => [...prev, newCourse]);
        setClasses(prev => [...prev, newClass]);
        setNewOtherName('');
    };

    const handleDeleteCourse = (courseId: string) => {
        const courseToDelete = courses.find(c => c.id === courseId);
        if (!courseToDelete) return;
    
        const isAcademic = courseToDelete.type !== 'other';
        const associatedClasses = classes.filter(c => c.courseId === courseId);
    
        let confirmationMessage = isAcademic
            ? `¿Seguro que quieres eliminar el curso '${courseToDelete.subject}'?`
            : `¿Seguro que quieres eliminar la ocupación '${courseToDelete.subject}'?`;
    
        if (isAcademic && associatedClasses.length > 0) {
            confirmationMessage += `\n\nADVERTENCIA: ${associatedClasses.length} clase(s) está(n) asociada(s) a este curso y también serán eliminadas.`;
        } else if (!isAcademic) {
            confirmationMessage += `\n\nEsto también eliminará la entrada correspondiente de tu horario semanal.`;
        }
    
        if (window.confirm(confirmationMessage)) {
            setCourses(prev => prev.filter(c => c.id !== courseId));
            setClasses(prev => prev.filter(c => c.courseId !== courseId));
        }
    };
    
    return (
        <div>
            <h3 className="text-xl font-bold text-slate-800 mb-4">Gestión de Cursos y Materias</h3>
            <div className="space-y-6">
                <div>
                    <h4 className="text-lg font-semibold text-slate-700 mb-2">Cursos Académicos</h4>
                    <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-2 border rounded-lg p-2 bg-slate-50/50">
                        {academicCourses.length > 0 ? academicCourses.map(course => (
                            <div key={course.id} className="flex items-center justify-between bg-white p-2 rounded-md border">
                                <p><span className="font-semibold text-slate-700">{course.level}</span> - {course.subject}</p>
                                <button onClick={() => handleDeleteCourse(course.id)} className="p-1 text-slate-400 hover:text-red-500 rounded-full" title="Eliminar curso"><TrashIcon className="w-4 h-4"/></button>
                            </div>
                        )) : <p className="text-slate-500 text-center py-4">No hay cursos académicos definidos.</p>}
                    </div>
                    <form onSubmit={handleAddCourse} className="flex flex-col sm:flex-row items-end gap-2 p-3 border rounded-lg">
                        <div className="w-full sm:w-auto flex-grow">
                            <label className="text-xs font-medium text-slate-600">Nivel Educativo</label>
                            <select value={newLevel} onChange={e => setNewLevel(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md mt-1">
                                <option>1º ESO</option> <option>2º ESO</option> <option>3º ESO</option> <option>4º ESO</option>
                                <option>1º Bachillerato</option> <option>2º Bachillerato</option>
                            </select>
                        </div>
                        <div className="w-full sm:w-auto flex-grow">
                            <label className="text-xs font-medium text-slate-600">Nombre de la Materia</label>
                            <input type="text" value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="Ej: Física y Química" className="w-full p-2 border border-slate-300 rounded-md mt-1"/>
                        </div>
                        <button type="submit" className="w-full sm:w-auto bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">Añadir Curso</button>
                    </form>
                </div>
                <div>
                    <h4 className="text-lg font-semibold text-slate-700 mb-2">Otras Ocupaciones (Guardias, Reuniones, etc.)</h4>
                    <p className="text-xs text-slate-500 mb-2">
                        Estas ocupaciones aparecerán en tu horario y calendario, pero no se considerarán clases a evaluar.
                    </p>
                     <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-2 border rounded-lg p-2 bg-slate-50/50">
                        {otherOccupations.length > 0 ? otherOccupations.map(course => (
                            <div key={course.id} className="flex items-center justify-between bg-white p-2 rounded-md border">
                                <p>{course.subject}</p>
                                <button onClick={() => handleDeleteCourse(course.id)} className="p-1 text-slate-400 hover:text-red-500 rounded-full" title="Eliminar ocupación"><TrashIcon className="w-4 h-4"/></button>
                            </div>
                        )) : <p className="text-slate-500 text-center py-4">No hay otras ocupaciones definidas.</p>}
                    </div>
                    <form onSubmit={handleAddOtherOccupation} className="flex items-end gap-2 p-3 border rounded-lg">
                        <div className="w-full flex-grow">
                            <label className="text-xs font-medium text-slate-600">Nombre de la Ocupación</label>
                            <input type="text" value={newOtherName} onChange={e => setNewOtherName(e.target.value)} placeholder="Ej: Guardia, Reunión Dpto." className="w-full p-2 border border-slate-300 rounded-md mt-1"/>
                        </div>
                        <button type="submit" className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700">Añadir Ocupación</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

// --- Academic Config Manager ---

const AcademicConfigManager: React.FC<{
    academicConfiguration: AcademicConfiguration;
    setAcademicConfiguration: (updater: React.SetStateAction<AcademicConfiguration>) => void;
}> = ({ academicConfiguration, setAcademicConfiguration }) => {
    
    useEffect(() => {
        // Self-healing for corrupted data.
        const needsUpdate = !academicConfiguration || 
                            !Array.isArray(academicConfiguration.holidays) || 
                            !Array.isArray(academicConfiguration.evaluationPeriods) ||
                            typeof academicConfiguration.evaluationPeriodWeights !== 'object' ||
                            academicConfiguration.evaluationPeriodWeights === null ||
                            !Array.isArray(academicConfiguration.gradeScale);
        
        if (needsUpdate) {
            setAcademicConfiguration(prev => ({
                ...prev,
                holidays: Array.isArray(prev?.holidays) ? prev.holidays : [],
                evaluationPeriods: Array.isArray(prev?.evaluationPeriods) ? prev.evaluationPeriods : [],
                evaluationPeriodWeights: (typeof prev?.evaluationPeriodWeights === 'object' && prev.evaluationPeriodWeights !== null) ? prev.evaluationPeriodWeights : {},
                periods: Array.isArray(prev?.periods) ? prev.periods : [],
                defaultStartView: prev?.defaultStartView || 'calendar',
                defaultCalendarView: prev?.defaultCalendarView || 'month',
                // Initialize defaults if missing
                gradeScale: Array.isArray(prev?.gradeScale) && prev.gradeScale.length > 0 ? prev.gradeScale : [
                    { min: 9, color: 'emerald', label: 'Sobresaliente' },
                    { min: 7, color: 'lime', label: 'Notable' },
                    { min: 6, color: 'yellow', label: 'Bien' },
                    { min: 5, color: 'orange', label: 'Suficiente' },
                    { min: 0, color: 'red', label: 'Insuficiente' },
                ]
            }));
        }
    }, [academicConfiguration, setAcademicConfiguration]);

    if (!academicConfiguration || !Array.isArray(academicConfiguration.holidays) || !Array.isArray(academicConfiguration.evaluationPeriods) || typeof academicConfiguration.evaluationPeriodWeights !== 'object' || academicConfiguration.evaluationPeriodWeights === null) {
        return <div className="text-center p-4">Cargando configuración...</div>;
    }
    
    const { evaluationPeriodWeights = {}, gradeScale = [] } = academicConfiguration;
    // Calculate total weight for display
    const totalWeight = Object.values(evaluationPeriodWeights).reduce((sum: number, w) => sum + (typeof w === 'number' ? w : 0), 0);


    const handleConfigChange = (field: keyof AcademicConfiguration, value: any) => {
        setAcademicConfiguration(prev => ({ ...prev, [field]: value }));
    };

    const handleListItemChange = (type: 'holidays' | 'evaluationPeriods' | 'periods', index: number, field: string, value: string) => {
        setAcademicConfiguration(prev => {
            const newList = [...(prev[type] || [])] as any[];
            if(type === 'periods') {
                newList[index] = value;
            } else {
                 newList[index] = { ...newList[index], [field]: value };
            }
            return { ...prev, [type]: newList };
        });
    };
    
    const handleAddListItem = (type: 'holidays' | 'evaluationPeriods' | 'periods') => {
        setAcademicConfiguration(prev => {
            const currentList = prev[type] || [];
            let newItem;
            if (type === 'periods') {
                newItem = `Nueva Franja ${currentList.length + 1}`;
            } else {
                newItem = { id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, name: 'Nuevo', startDate: '', endDate: '' };
            }
            return { ...prev, [type]: [...currentList, newItem] };
        });
    };
    
    const handleRemoveListItem = (type: 'holidays' | 'evaluationPeriods' | 'periods', idOrIndex: string | number) => {
        setAcademicConfiguration(prev => {
            const currentList = prev[type] || [];
            let newList;
            if (type === 'periods') {
                 newList = currentList.filter((_, index) => index !== idOrIndex);
            } else {
                 newList = (currentList as (Holiday | EvaluationPeriod)[]).filter(item => item.id !== idOrIndex);
            }
            return { ...prev, [type]: newList };
        });
    };
    
    const handleWeightChange = (periodId: string, weight: string) => {
        const numWeight = parseFloat(weight);
        setAcademicConfiguration(prev => ({
            ...prev,
            evaluationPeriodWeights: {
                ...(prev.evaluationPeriodWeights || {}),
                [periodId]: isNaN(numWeight) ? 0 : numWeight,
            }
        }));
    };

    const handleGradeScaleChange = (index: number, field: keyof GradeScaleRule, value: any) => {
        setAcademicConfiguration(prev => {
            const newScale = [...(prev.gradeScale || [])];
            newScale[index] = { ...newScale[index], [field]: value };
            return { ...prev, gradeScale: newScale };
        });
    };

    const handleAddGradeRule = () => {
        setAcademicConfiguration(prev => ({
            ...prev,
            gradeScale: [...(prev.gradeScale || []), { min: 0, color: 'gray', label: 'Nueva Regla' }]
        }));
    };

    const handleRemoveGradeRule = (index: number) => {
        setAcademicConfiguration(prev => ({
            ...prev,
            gradeScale: (prev.gradeScale || []).filter((_, i) => i !== index)
        }));
    };

    return (
        <div className="space-y-8 pb-8">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Configuración del Curso Académico</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="font-semibold text-slate-700 mb-2">Fechas del Curso</h4>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs text-slate-500">Inicio</label>
                            <input type="date" value={academicConfiguration.academicYearStart} onChange={e => handleConfigChange('academicYearStart', e.target.value)} className="w-full p-2 border rounded-md"/>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500">Fin</label>
                            <input type="date" value={academicConfiguration.academicYearEnd} onChange={e => handleConfigChange('academicYearEnd', e.target.value)} className="w-full p-2 border rounded-md"/>
                        </div>
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold text-slate-700 mb-2">Periodos de Evaluación</h4>
                    <div className="space-y-2">
                        {academicConfiguration.evaluationPeriods.map((period, index) => (
                            <div key={period.id} className="flex gap-2 items-center">
                                <input type="text" value={period.name} onChange={e => handleListItemChange('evaluationPeriods', index, 'name', e.target.value)} className="w-1/3 p-2 border rounded-md text-sm" placeholder="Nombre"/>
                                <input type="date" value={period.startDate} onChange={e => handleListItemChange('evaluationPeriods', index, 'startDate', e.target.value)} className="w-1/3 p-2 border rounded-md text-sm"/>
                                <input type="date" value={period.endDate} onChange={e => handleListItemChange('evaluationPeriods', index, 'endDate', e.target.value)} className="w-1/3 p-2 border rounded-md text-sm"/>
                                <button onClick={() => handleRemoveListItem('evaluationPeriods', period.id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><TrashIcon className="w-4 h-4"/></button>
                            </div>
                        ))}
                        <button onClick={() => handleAddListItem('evaluationPeriods')} className="text-sm text-blue-600 hover:underline">+ Añadir Periodo</button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="font-semibold text-slate-700 mb-2">Ponderación de Evaluaciones</h4>
                    <p className="text-xs text-slate-500 mb-2">Asigna un peso proporcional a cada evaluación. El porcentaje se calcula automáticamente.</p>
                    <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                        {academicConfiguration.evaluationPeriods.map((period) => {
                            const weight = evaluationPeriodWeights[period.id] ?? 1;
                            const percentage = totalWeight > 0 ? ((weight / totalWeight) * 100).toFixed(1) : '0.0';
                            return (
                                <div key={period.id} className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-slate-700">{period.name}</span>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="number" 
                                            min="0"
                                            step="0.1"
                                            value={weight} 
                                            onChange={e => handleWeightChange(period.id, e.target.value)} 
                                            className="w-16 p-1 text-right border rounded-md text-sm"
                                        />
                                        <span className="text-xs text-slate-500 w-12 text-right">{percentage}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                
                <div>
                    <h4 className="font-semibold text-slate-700 mb-2">Vacaciones y Festivos</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {academicConfiguration.holidays.map((holiday, index) => (
                            <div key={holiday.id} className="flex gap-2 items-center">
                                <input type="text" value={holiday.name} onChange={e => handleListItemChange('holidays', index, 'name', e.target.value)} className="flex-grow p-1 border rounded-md text-xs" placeholder="Nombre festivo"/>
                                <input type="date" value={holiday.startDate} onChange={e => handleListItemChange('holidays', index, 'startDate', e.target.value)} className="w-24 p-1 border rounded-md text-xs"/>
                                <input type="date" value={holiday.endDate} onChange={e => handleListItemChange('holidays', index, 'endDate', e.target.value)} className="w-24 p-1 border rounded-md text-xs"/>
                                <button onClick={() => handleRemoveListItem('holidays', holiday.id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><TrashIcon className="w-3 h-3"/></button>
                            </div>
                        ))}
                        <button onClick={() => handleAddListItem('holidays')} className="text-xs text-blue-600 hover:underline">+ Añadir Festivo</button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="font-semibold text-slate-700 mb-2">Franjas Horarias</h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                        {(academicConfiguration.periods || []).map((period, index) => (
                            <div key={index} className="flex gap-2 items-center">
                                <span className="text-xs text-slate-400 w-4">{index + 1}</span>
                                <input type="text" value={period} onChange={e => handleListItemChange('periods', index, '', e.target.value)} className="flex-grow p-1 border rounded-md text-sm"/>
                                <button onClick={() => handleRemoveListItem('periods', index)} className="p-1 text-red-500 hover:bg-red-50 rounded"><TrashIcon className="w-3 h-3"/></button>
                            </div>
                        ))}
                        <button onClick={() => handleAddListItem('periods')} className="text-xs text-blue-600 hover:underline">+ Añadir Franja</button>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-slate-700 mb-2">Escala de Calificaciones (Semáforo)</h4>
                    <p className="text-xs text-slate-500 mb-2">
                        Define la nota mínima (&gt;=) a partir de la cual se aplica el color. El sistema prioriza el valor más alto alcanzado (ej. si tienes &gt;=5 y &gt;=7, un 8 usará el color de 7, no el de 5).
                    </p>
                    <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200 max-h-60 overflow-y-auto">
                        {gradeScale.map((rule, index) => (
                            <div key={index} className="flex gap-2 items-center">
                                <div className="flex items-center gap-1">
                                    <span className="text-xs text-slate-500">≥</span>
                                    <input 
                                        type="number" 
                                        min="0" 
                                        max="10" 
                                        step="0.1" 
                                        value={rule.min} 
                                        onChange={e => handleGradeScaleChange(index, 'min', parseFloat(e.target.value))} 
                                        className="w-14 p-1 border rounded-md text-sm text-center"
                                    />
                                </div>
                                <select 
                                    value={rule.color} 
                                    onChange={e => handleGradeScaleChange(index, 'color', e.target.value)}
                                    className="p-1 border rounded-md text-sm"
                                >
                                    <option value="emerald">Esmeralda (Verde oscuro)</option>
                                    <option value="green">Verde</option>
                                    <option value="lime">Lima</option>
                                    <option value="yellow">Amarillo</option>
                                    <option value="orange">Naranja</option>
                                    <option value="red">Rojo</option>
                                    <option value="teal">Turquesa</option>
                                    <option value="blue">Azul</option>
                                    <option value="indigo">Índigo</option>
                                    <option value="violet">Violeta</option>
                                    <option value="gray">Gris</option>
                                </select>
                                <input 
                                    type="text" 
                                    value={rule.label || ''} 
                                    onChange={e => handleGradeScaleChange(index, 'label', e.target.value)} 
                                    placeholder="Etiqueta (opcional)"
                                    className="flex-grow p-1 border rounded-md text-sm"
                                />
                                <button onClick={() => handleRemoveGradeRule(index)} className="p-1 text-red-500 hover:bg-red-50 rounded"><TrashIcon className="w-4 h-4"/></button>
                            </div>
                        ))}
                        <button onClick={handleAddGradeRule} className="text-sm text-blue-600 hover:underline">+ Añadir Regla</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ... (BackupManager component remains unchanged) ...
const BackupManager: React.FC<any> = ({ importDatabase, exportDatabase, resetDatabase, onOpenExportModal }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = () => fileInputRef.current?.click();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const buffer = await file.arrayBuffer();
        await importDatabase(buffer);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleExportClick = () => {
        const data = exportDatabase();
        if (data) {
            const blob = new Blob([data], { type: 'application/x-sqlite3' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cuaderno_backup_${new Date().toISOString().split('T')[0]}.db`;
            a.click();
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800">Copia de Seguridad y Datos</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                    <h4 className="font-bold text-blue-800 mb-2">Exportar Copia de Seguridad</h4>
                    <p className="text-sm text-blue-700 mb-4">Descarga un archivo .db con TODOS tus datos (clases, notas, configuración...).</p>
                    <button onClick={handleExportClick} className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm font-medium">
                        Descargar Copia (.db)
                    </button>
                </div>

                <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                    <h4 className="font-bold text-green-800 mb-2">Restaurar Copia</h4>
                    <p className="text-sm text-green-700 mb-4">Sube un archivo .db previamente exportado para restaurar tus datos.</p>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".db,.sqlite" className="hidden" />
                    <button onClick={handleImportClick} className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors shadow-sm font-medium">
                        Subir Archivo (.db)
                    </button>
                </div>

                <div className="p-4 border rounded-lg bg-slate-50 border-slate-200">
                    <h4 className="font-bold text-slate-800 mb-2">Informes CSV</h4>
                    <p className="text-sm text-slate-600 mb-4">Exporta las calificaciones e informes a hojas de cálculo (Excel/CSV).</p>
                    <button onClick={onOpenExportModal} className="w-full bg-white text-slate-700 border border-slate-300 py-2 rounded-md hover:bg-slate-100 transition-colors shadow-sm font-medium">
                        Generar Informes
                    </button>
                </div>
            </div>

            <div className="pt-6 border-t border-red-200 mt-8">
                <h4 className="text-lg font-bold text-red-800 mb-2">Zona de Peligro</h4>
                <div className="p-4 border border-red-200 bg-red-50 rounded-lg flex items-center justify-between">
                    <div>
                        <p className="font-bold text-red-700">Borrar todos los datos</p>
                        <p className="text-sm text-red-600">Esta acción no se puede deshacer. Se eliminará todo el contenido de la aplicación.</p>
                    </div>
                    <button onClick={resetDatabase} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 font-medium shadow-sm">
                        Restablecer Aplicación
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
