
// FIX: Corrected the React import statement.
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import Modal from './Modal';
import { UserGroupIcon, AcademicCapIcon, ArrowDownTrayIcon, PencilIcon, TrashIcon, PlusIcon, BookOpenIcon, ClockIcon, CalendarDaysIcon, ListBulletIcon, ArrowUpIcon, ArrowDownIcon, BeakerIcon, DevicePhoneMobileIcon, DeviceTabletIcon, ComputerDesktopIcon } from './Icons';
import type { ClassData, Course, Student, KeyCompetence, SpecificCompetence, EvaluationCriterion, JournalEntry, OperationalDescriptor, AcademicConfiguration, Holiday, EvaluationPeriod, BasicKnowledge, ProgrammingUnit, EvaluationTool } from '../types';
import { ACNEAE_TAGS } from '../constants';
import ClassModal from './ClassModal';
import BulkAddStudentModal from './BulkAddStudentModal';
import ExportModal from './ExportModal';
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
            <div className="flex flex-col md:flex-row gap-8">
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
                <main className="flex-grow min-w-0">
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

// ... (Other managers like ClassManager, ScheduleManager, CourseManager - unchanged) ...
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
                // Check if the current class has the slot being changed
                const hasSlot = oldSchedule.some(slot => slot.day === day && slot.periodIndex === periodIndex);

                // Case 1: The class is the new owner. Add the slot if it doesn't have it.
                if (c.id === newClassId) {
                    return hasSlot ? c : { ...c, schedule: [...oldSchedule, { day, periodIndex }] };
                } 
                
                // Case 2: The class is not the new owner, but has the slot. Remove it.
                if (hasSlot) {
                    return { ...c, schedule: oldSchedule.filter(slot => !(slot.day === day && slot.periodIndex === periodIndex)) };
                }

                // Case 3: The class is not affected.
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
            // Always remove associated classes, regardless of type, to prevent orphans.
            setClasses(prev => prev.filter(c => c.courseId !== courseId));
        }
    };
    
    return (
        <div>
            <h3 className="text-xl font-bold text-slate-800 mb-4">Gestión de Cursos y Materias</h3>
            <div className="space-y-6">
                {/* Academic Courses Section */}
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
                {/* Other Occupations Section */}
                <div>
                    <h4 className="text-lg font-semibold text-slate-700 mb-2">Otras Ocupaciones (Guardias, Reuniones, etc.)</h4>
                    <p className="text-xs text-slate-500 mb-2">
                        Estas ocupaciones aparecerán en tu horario y calendario, pero no se considerarán clases a evaluar (no tendrán alumnado ni calificaciones).
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
                            academicConfiguration.evaluationPeriodWeights === null;
        
        if (needsUpdate) {
            setAcademicConfiguration(prev => ({
                ...prev,
                holidays: Array.isArray(prev?.holidays) ? prev.holidays : [],
                evaluationPeriods: Array.isArray(prev?.evaluationPeriods) ? prev.evaluationPeriods : [],
                evaluationPeriodWeights: (typeof prev?.evaluationPeriodWeights === 'object' && prev.evaluationPeriodWeights !== null) ? prev.evaluationPeriodWeights : {},
                periods: Array.isArray(prev?.periods) ? prev.periods : [],
                defaultStartView: prev?.defaultStartView || 'calendar',
                defaultCalendarView: prev?.defaultCalendarView || 'month',
            }));
        }
    }, [academicConfiguration, setAcademicConfiguration]);

    if (!academicConfiguration || !Array.isArray(academicConfiguration.holidays) || !Array.isArray(academicConfiguration.evaluationPeriods) || typeof academicConfiguration.evaluationPeriodWeights !== 'object' || academicConfiguration.evaluationPeriodWeights === null) {
        return <div className="text-center p-4">Cargando configuración...</div>;
    }
    
    const { evaluationPeriodWeights = {} } = academicConfiguration;
    // FIX: Explicitly type the accumulator in the reduce function to 'number' to resolve the TypeScript error.
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
        const numWeight = parseInt(weight, 10);
        setAcademicConfiguration(prev => ({
            ...prev,
            evaluationPeriodWeights: {
                ...prev.evaluationPeriodWeights,
                [periodId]: isNaN(numWeight) ? 0 : numWeight,
            }
        }));
    };

    return (
        <div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Configuración del Curso Académico</h3>
             <p className="text-sm text-slate-600 mb-4">Define las fechas y periodos clave del curso para la planificación.</p>

            <div className="space-y-6">
                
                {/* New Defaults Section */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
                    <h4 className="font-semibold text-slate-700">Preferencias de Inicio</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Pantalla inicial al abrir la App</label>
                            <select 
                                value={academicConfiguration.defaultStartView || 'calendar'} 
                                onChange={e => handleConfigChange('defaultStartView', e.target.value)} 
                                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                            >
                                <option value="calendar">Calendario</option>
                                <option value="gradebook">Cuaderno</option>
                                <option value="journal">Diario de Clase</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Vista por defecto del Calendario</label>
                            <select 
                                value={academicConfiguration.defaultCalendarView || 'month'} 
                                onChange={e => handleConfigChange('defaultCalendarView', e.target.value)} 
                                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                            >
                                <option value="month">Mes</option>
                                <option value="week">Semana</option>
                                <option value="day">Día</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700">Inicio del curso</label>
                        <input type="date" value={academicConfiguration.academicYearStart} onChange={e => handleConfigChange('academicYearStart', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg mt-1"/>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700">Fin del curso</label>
                        <input type="date" value={academicConfiguration.academicYearEnd} onChange={e => handleConfigChange('academicYearEnd', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg mt-1"/>
                    </div>
                </div>

                {/* Layout Mode Selector with Icons */}
                <div>
                    <label className="text-sm font-medium text-slate-700">Tamaño de Pantalla (Diseño)</label>
                    <div className="flex items-center space-x-2 mt-1">
                        <button
                            onClick={() => handleConfigChange('layoutMode', 'mobile')}
                            className={`p-2 rounded-lg border ${academicConfiguration.layoutMode === 'mobile' ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                            title="Vista Móvil"
                        >
                            <DevicePhoneMobileIcon className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() => handleConfigChange('layoutMode', 'tablet')}
                            className={`p-2 rounded-lg border ${academicConfiguration.layoutMode === 'tablet' ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                            title="Vista Tablet"
                        >
                            <DeviceTabletIcon className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() => handleConfigChange('layoutMode', 'desktop')}
                            className={`p-2 rounded-lg border ${academicConfiguration.layoutMode === 'desktop' || !academicConfiguration.layoutMode ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                            title="Vista Escritorio"
                        >
                            <ComputerDesktopIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Ajusta la densidad de la información en pantalla.</p>
                </div>

                <ConfigListSection title="Franjas Horarias" type="periods" items={academicConfiguration.periods || []} onAdd={handleAddListItem} onRemove={handleRemoveListItem} onChange={handleListItemChange} />
                <ConfigListSection title="Periodos de Evaluación" type="evaluationPeriods" items={academicConfiguration.evaluationPeriods} onAdd={handleAddListItem} onRemove={handleRemoveListItem} onChange={handleListItemChange} />
                
                <div>
                    <h4 className="text-lg font-semibold text-slate-700 mb-2">Ponderación de Evaluaciones para Nota Final</h4>
                    <div className="space-y-2 p-3 border rounded-lg bg-slate-50/50">
                        {academicConfiguration.evaluationPeriods.map(period => (
                            <div key={period.id} className="flex items-center gap-4">
                                <label className="flex-grow font-medium text-slate-600">{period.name}</label>
                                <div className="flex items-center">
                                    <input 
                                        type="number" 
                                        value={evaluationPeriodWeights[period.id] || ''} 
                                        onChange={e => handleWeightChange(period.id, e.target.value)} 
                                        className="w-20 p-2 text-center border rounded-md"
                                        placeholder="0"
                                        min="0"
                                        max="100"
                                    />
                                    <span className="ml-2 font-semibold text-slate-500">%</span>
                                </div>
                            </div>
                        ))}
                        <div className={`p-2 mt-2 text-sm font-semibold text-center rounded-md ${totalWeight === 100 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            Ponderación Total: {totalWeight}%
                        </div>
                    </div>
                </div>

                <ConfigListSection title="Periodos Festivos" type="holidays" items={academicConfiguration.holidays} onAdd={handleAddListItem} onRemove={handleRemoveListItem} onChange={handleListItemChange} />
            </div>
        </div>
    );
};

const ConfigListSection: React.FC<{ title: string; type: 'holidays' | 'evaluationPeriods' | 'periods'; items: any[]; onAdd: any; onRemove: any; onChange: any }> = ({ title, type, items, onAdd, onRemove, onChange}) => {
    if (type === 'periods') {
        return (
             <div>
                <h4 className="text-lg font-semibold text-slate-700 mb-2">{title}</h4>
                <div className="space-y-2 p-3 border rounded-lg bg-slate-50/50">
                    {items.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                           <input type="text" value={item} onChange={e => onChange(type, index, 'name', e.target.value)} placeholder="Ej: 1ª Hora (8:00-8:55)" className="p-2 border rounded-md w-full"/>
                           <button onClick={() => onRemove(type, index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full flex-shrink-0"><TrashIcon className="w-4 h-4"/></button>
                        </div>
                    ))}
                    <button onClick={() => onAdd(type)} className="w-full text-sm font-semibold text-blue-600 hover:bg-blue-100 p-2 rounded-md">+ Añadir franja</button>
                </div>
            </div>
        );
    }
    
    return (
        <div>
            <h4 className="text-lg font-semibold text-slate-700 mb-2">{title}</h4>
            <div className="space-y-2 p-3 border rounded-lg bg-slate-50/50">
                {items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-2 items-center">
                        <input type="text" value={item.name} onChange={e => onChange(type, index, 'name', e.target.value)} placeholder="Nombre" className="p-2 border rounded-md w-full"/>
                        <input type="date" value={item.startDate} onChange={e => onChange(type, index, 'startDate', e.target.value)} className="p-2 border rounded-md w-full"/>
                        <input type="date" value={item.endDate} onChange={e => onChange(type, index, 'endDate', e.target.value)} className="p-2 border rounded-md w-full"/>
                        <button onClick={() => onRemove(type, item.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full flex-shrink-0 justify-self-center -ml-2"><TrashIcon className="w-4 h-4"/></button>
                    </div>
                ))}
                <button onClick={() => onAdd(type)} className="w-full text-sm font-semibold text-blue-600 hover:bg-blue-100 p-2 rounded-md">+ Añadir periodo</button>
            </div>
        </div>
    );
};


const BackupManager: React.FC<Omit<SettingsModalProps, 'isOpen'>> = (props) => {
    const { onOpenExportModal, importDatabase, exportDatabase, resetDatabase, onClose } = props;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExportDb = () => {
        const data = exportDatabase();
        if (!data) {
            alert("No se pudo exportar la base de datos.");
            return;
        }
        const blob = new Blob([data], { type: "application/x-sqlite3" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `gradebook_db_backup_${new Date().toISOString().split('T')[0]}.sqlite`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleImportDb = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!window.confirm("¿Estás seguro de que quieres restaurar desde este archivo? Todos los datos actuales se sobrescribirán.")) {
            if (event.target) event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const buffer = e.target?.result as ArrayBuffer;
                await importDatabase(buffer);
                onClose(); // Close modal on success
            } catch (error) {
                console.error("Error importing DB:", error);
                alert("Error al importar el archivo. Asegúrate de que es una base de datos válida y no está corrupto.");
            } finally {
                if (event.target) event.target.value = '';
            }
        };
        reader.readAsArrayBuffer(file);
    };
    
    return (
         <div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Base de Datos y Exportaciones</h3>
            <p className="text-sm text-slate-600 mb-6">
                Guarda toda la información de tu cuaderno en un archivo de base de datos (`.sqlite`) o restáurala. Este es el método recomendado para copias de seguridad completas.
            </p>
            <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                 <h4 className="text-md font-semibold text-slate-700">Base de Datos Principal</h4>
                <button onClick={handleExportDb} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 w-full text-center">
                    Descargar base de datos (.sqlite)
                </button>
                
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".sqlite, .db, application/x-sqlite3"
                    onChange={handleImportDb}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer block bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 w-full text-center"
                >
                    Cargar base de datos (.sqlite)
                </button>
            </div>
            <div className="space-y-4 p-4 mt-6 border rounded-lg bg-slate-50">
                 <h4 className="text-md font-semibold text-slate-700">Exportaciones Adicionales</h4>
                 <p className="text-xs text-slate-500">
                    Exporta informes y calificaciones en formatos para hojas de cálculo.
                </p>
                 <button onClick={onOpenExportModal} className="bg-slate-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-600 w-full text-center">
                    Exportar informes a CSV...
                </button>
            </div>

            <div className="pt-6 border-t border-red-200 mt-6">
                <h4 className="text-lg font-bold text-red-800 mb-2">Zona de Peligro</h4>
                <div className="p-3 bg-red-50 rounded-lg border border-red-200 space-y-3">
                    <p className="text-sm text-slate-600">
                        Esta acción es irreversible. Se borrarán todos los datos y la aplicación volverá a su estado inicial. Úsalo si encuentras errores persistentes o quieres empezar de cero.
                    </p>
                    <button
                        onClick={resetDatabase}
                        className="w-full text-center bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Restablecer Aplicación y Borrar Todos los Datos
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SettingsModal;
