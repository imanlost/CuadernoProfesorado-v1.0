
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { ClassData, Student, Assignment, Grade, EvaluationCriterion, Category, SpecificCompetence, KeyCompetence, ProgrammingUnit, EvaluationPeriod, AcademicConfiguration, EvaluationTool, Course } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, LinkIcon, BookOpenIcon, ClipboardDocumentIcon, ChevronLeftIcon, ChevronRightIcon, ArrowUpTrayIcon, DocumentDuplicateIcon } from './Icons';
import AssignmentModal from './AssignmentModal';
import GradeEntryModal from './GradeEntryModal';
import CategoryModal from './CategoryModal';
import AcneaeTag from './AcneaeTag';
import { calculateAssignmentScoresForStudent, calculateEvaluationPeriodGradeForStudent, calculateOverallFinalGradeForStudent, calculateCriterionScoresFromTool } from '../services/gradeCalculations';
import BulkGradeImportModal from './BulkGradeImportModal';
import StudentSummaryModal from './StudentSummaryModal';
import CopyAssignmentModal from './CopyAssignmentModal';


interface GradebookTableProps {
  classData: ClassData;
  allClasses: ClassData[];
  allCourses: Course[];
  criteria: EvaluationCriterion[];
  specificCompetences: SpecificCompetence[];
  keyCompetences: KeyCompetence[];
  programmingUnits: ProgrammingUnit[];
  academicConfiguration: AcademicConfiguration;
  setAcademicConfiguration: (updater: React.SetStateAction<AcademicConfiguration>) => void;
  onUpdateClass: (updatedClass: ClassData) => void;
  evaluationTools: EvaluationTool[];
  setActiveClassId?: (id: string) => void; // Optional setter to change active class from tabs
  onCopyAssignment: (sourceAssignment: Assignment, targetClassId: string, targetPeriodId: string, targetCategoryId: string) => void;
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

const toYYYYMMDD = (date: Date): string => {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
};

const GradebookTable: React.FC<GradebookTableProps> = (props) => {
  const { classData, allClasses, allCourses, criteria, specificCompetences, keyCompetences, programmingUnits, academicConfiguration, setAcademicConfiguration, onUpdateClass, evaluationTools, setActiveClassId, onCopyAssignment } = props;
  const { evaluationPeriods } = academicConfiguration;
  
  // Initialize with a dummy value, will be set by useEffect
  const [activePeriodId, setActivePeriodId] = useState<string>('final');
  const [hasAutoSelectedPeriod, setHasAutoSelectedPeriod] = useState(false);
  
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [assignmentToEdit, setAssignmentToEdit] = useState<Assignment | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  
  const [isGradeEntryModalOpen, setIsGradeEntryModalOpen] = useState(false);
  const [gradeEntryData, setGradeEntryData] = useState<{ student: Student; assignment: Assignment; grade: Grade | null } | null>(null);
  
  const [isCopyCatOpen, setIsCopyCatOpen] = useState(false);
  const [selectedSourceClassId, setSelectedSourceClassId] = useState<string>(classData.id);
  const copyCatRef = useRef<HTMLDivElement>(null);

  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [assignmentForImport, setAssignmentForImport] = useState<Assignment | null>(null);

  // State for Student Summary Modal
  const [selectedStudentForSummary, setSelectedStudentForSummary] = useState<Student | null>(null);

  // State for Copy Assignment Modal
  const [assignmentToCopy, setAssignmentToCopy] = useState<Assignment | null>(null);

  // Auto-select the current period based on date
  useEffect(() => {
      if (!hasAutoSelectedPeriod && evaluationPeriods.length > 0) {
          const today = toYYYYMMDD(new Date());
          const currentPeriod = evaluationPeriods.find(p => today >= p.startDate && today <= p.endDate);
          
          if (currentPeriod) {
              setActivePeriodId(currentPeriod.id);
          } else {
              // If not in any period range, check if year ended
              const yearEnd = academicConfiguration.academicYearEnd;
              if (yearEnd && today > yearEnd) {
                  setActivePeriodId('final');
              } else {
                  // Default to first period or final if none match
                  setActivePeriodId(evaluationPeriods[0]?.id || 'final');
              }
          }
          setHasAutoSelectedPeriod(true);
      }
  }, [evaluationPeriods, academicConfiguration.academicYearEnd, hasAutoSelectedPeriod]);

  useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
          if (copyCatRef.current && !copyCatRef.current.contains(event.target as Node)) {
              setIsCopyCatOpen(false);
          }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
          document.removeEventListener("mousedown", handleClickOutside);
      };
  }, [copyCatRef]);

  useEffect(() => {
      if (isCopyCatOpen) {
          setSelectedSourceClassId(classData.id);
      }
  }, [isCopyCatOpen, classData.id]);

  const gradesMap = useMemo(() => {
    const map = new Map<string, Grade>();
    classData.grades.forEach(grade => {
      map.set(`${grade.studentId}-${grade.assignmentId}`, grade);
    });
    return map;
  }, [classData.grades]);
  
  const studentPeriodGrades = useMemo(() => {
    const periodGrades = new Map<string, Map<string, { grade: number | null; styleClasses: string }>>();
    for (const student of classData.students) {
        const studentGrades = new Map<string, { grade: number | null; styleClasses: string }>();
        evaluationPeriods.forEach(period => {
            studentGrades.set(period.id, calculateEvaluationPeriodGradeForStudent(student.id, classData, period.id));
        });
        periodGrades.set(student.id, studentGrades);
    }
    return periodGrades;
  }, [classData, evaluationPeriods]);

  const studentOverallFinalGrades = useMemo(() => {
      const finalGrades = new Map<string, { grade: string; styleClasses: string }>();
      for (const student of classData.students) {
          finalGrades.set(student.id, calculateOverallFinalGradeForStudent(student.id, classData, academicConfiguration));
      }
      return finalGrades;
  }, [classData, academicConfiguration]);

  const handleSaveAssignment = (assignmentData: Omit<Assignment, 'id' | 'categoryId'> & { id?: string }) => {
    if (!activeCategory) return;
    const assignment = { ...assignmentData, categoryId: activeCategory.id };

    const existingIndex = classData.assignments.findIndex(a => a.id === assignment.id);
    let updatedAssignments;
    if (existingIndex > -1) {
      updatedAssignments = classData.assignments.map(a => a.id === assignment.id ? { ...a, ...assignment } : a);
    } else {
      updatedAssignments = [...classData.assignments, { ...assignment, id: `a-${Date.now()}-${Math.random().toString(36).substring(2, 7)}` }];
    }
    onUpdateClass({ ...classData, assignments: updatedAssignments });
  };
  
  const handleSaveCategory = (category: Category) => {
      const existingIndex = classData.categories.findIndex(c => c.id === category.id);
      let updatedCategories;
      if (existingIndex > -1) {
          updatedCategories = classData.categories.map(c => c.id === category.id ? category : c);
      } else {
          updatedCategories = [...classData.categories, category];
      }
      onUpdateClass({ ...classData, categories: updatedCategories });
  };

  const handleEditAssignment = (assignment: Assignment) => {
    const category = classData.categories.find(c => c.id === assignment.categoryId);
    if(category){
        setActiveCategory(category);
        setAssignmentToEdit(assignment);
        setIsAssignmentModalOpen(true);
    }
  };

   const handleDeleteAssignment = (assignmentId: string) => {
    if(window.confirm("¿Seguro que quieres eliminar esta tarea y todas sus calificaciones?")) {
        const updatedAssignments = classData.assignments.filter(a => a.id !== assignmentId);
        const updatedGrades = classData.grades.filter(g => g.assignmentId !== assignmentId);
        onUpdateClass({ ...classData, assignments: updatedAssignments, grades: updatedGrades });
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    if(window.confirm("¿Seguro que quieres eliminar esta categoría y TODAS sus tareas y calificaciones?")) {
        const updatedCategories = classData.categories.filter(c => c.id !== categoryId);
        const assignmentsToDelete = classData.assignments.filter(a => a.categoryId === categoryId);
        const assignmentsToDeleteIds = new Set(assignmentsToDelete.map(a => a.id));
        const updatedAssignments = classData.assignments.filter(a => a.categoryId !== categoryId);
        const updatedGrades = classData.grades.filter(g => !assignmentsToDeleteIds.has(g.assignmentId));
        onUpdateClass({ ...classData, categories: updatedCategories, assignments: updatedAssignments, grades: updatedGrades });
    }
  };
  
  const handleOpenGradeEntry = (student: Student, assignment: Assignment) => {
    const grade = gradesMap.get(`${student.id}-${assignment.id}`) || null;
    setGradeEntryData({ student, assignment, grade });
    setIsGradeEntryModalOpen(true);
  };

  const handleSaveGrade = (studentId: string, assignmentId: string, data: { criterionScores: Record<string, number | null> } | { toolResults: Record<string, boolean | string> }) => {
    const assignment = classData.assignments.find(a => a.id === assignmentId);
    if (!assignment) return;

    let finalCriterionScores: Record<string, number | null>;
    let finalToolResults = 'toolResults' in data ? data.toolResults : undefined;

    if ('criterionScores' in data) {
        finalCriterionScores = data.criterionScores;
    } else {
        const tool = evaluationTools.find(t => t.id === assignment.evaluationToolId);
        if (!tool) {
            console.error("Evaluation tool not found for assignment");
            return;
        }
        finalCriterionScores = calculateCriterionScoresFromTool(tool, data.toolResults);
    }

    const existingGradeIndex = classData.grades.findIndex(
      (g) => g.studentId === studentId && g.assignmentId === assignmentId
    );

    let updatedGrades: Grade[];
    
    const hasScores = Object.values(finalCriterionScores).some(s => s !== null);
    // Fix: Allow saving if there are tool results, even if score is null (e.g. unlinked tool)
    const hasToolResults = finalToolResults && Object.keys(finalToolResults).length > 0;

    const newGradeData: Grade = {
        studentId,
        assignmentId,
        criterionScores: finalCriterionScores,
        toolResults: finalToolResults,
    };

    if (existingGradeIndex > -1) {
        if (!hasScores && !hasToolResults) {
             // If no scores and no tool results, remove the grade entry entirely
             updatedGrades = classData.grades.filter((_, index) => index !== existingGradeIndex);
        } else {
            updatedGrades = classData.grades.map((g, i) =>
              i === existingGradeIndex ? { ...g, ...newGradeData } : g
            );
        }
    } else if (hasScores || hasToolResults) {
        updatedGrades = [...classData.grades, newGradeData];
    } else {
        return; // Nothing to save
    }
    onUpdateClass({ ...classData, grades: updatedGrades });
    setIsGradeEntryModalOpen(false);
  };

  const handleBulkSaveGrades = (gradesToSave: Map<string, number>) => {
    if (!assignmentForImport) return;

    const assignmentId = assignmentForImport.id;
    const linkedCriteriaIds = assignmentForImport.linkedCriteria.map(lc => lc.criterionId);
    const hasLinkedCriteria = linkedCriteriaIds.length > 0;
    
    let updatedGrades = [...classData.grades];

    gradesToSave.forEach((score, studentId) => {
        const criterionScores = hasLinkedCriteria
            ? Object.fromEntries(linkedCriteriaIds.map(id => [id, score]))
            : { 'manual_grade': score };
        
        const existingGradeIndex = updatedGrades.findIndex(g => g.studentId === studentId && g.assignmentId === assignmentId);

        if (existingGradeIndex > -1) {
            updatedGrades[existingGradeIndex] = { ...updatedGrades[existingGradeIndex], criterionScores };
        } else {
            updatedGrades.push({ studentId, assignmentId, criterionScores });
        }
    });

    onUpdateClass({ ...classData, grades: updatedGrades });
  };
  
  const categoriesForPeriod = useMemo(() => classData.categories.filter(c => c.evaluationPeriodId === activePeriodId), [classData.categories, activePeriodId]);
  const assignmentsForPeriod = useMemo(() => classData.assignments.filter(a => a.evaluationPeriodId === activePeriodId), [classData.assignments, activePeriodId]);
  const totalWeightForPeriod = useMemo(() => categoriesForPeriod.reduce((sum, c) => sum + c.weight, 0), [categoriesForPeriod]);
  
  const studentAssignmentScores = useMemo(() => {
    const allScores = new Map<string, Map<string, number | null>>();
    for (const student of classData.students) {
      allScores.set(student.id, calculateAssignmentScoresForStudent(student.id, assignmentsForPeriod, classData.grades));
    }
    return allScores;
  }, [classData.students, assignmentsForPeriod, classData.grades]);

  const handleWeightChange = (periodId: string, weight: string) => {
      const numWeight = parseInt(weight, 10);
      setAcademicConfiguration(prev => ({
          ...prev,
          evaluationPeriodWeights: {
              ...(prev.evaluationPeriodWeights || {}),
              [periodId]: isNaN(numWeight) ? 0 : numWeight,
          }
      }));
  };

  // FIX: Explicitly type the accumulator in the reduce function to 'number' to resolve the TypeScript error.
  const totalWeightFinalTab = Object.values(academicConfiguration.evaluationPeriodWeights || {}).reduce((sum: number, w) => sum + (typeof w === 'number' ? w : 0), 0);

  const sortedClassesForCopy = useMemo(() => {
      const sorted = [...allClasses];
      sorted.sort((a, b) => {
          // Current class first
          if (a.id === classData.id) return -1;
          if (b.id === classData.id) return 1;
          
          // Same course level second
          const aCourse = allCourses.find(c => c.id === a.courseId);
          const bCourse = allCourses.find(c => c.id === b.courseId);
          const currentCourse = allCourses.find(c => c.id === classData.courseId);
          
          const aSameCourse = aCourse && currentCourse && aCourse.level === currentCourse.level && aCourse.subject === currentCourse.subject;
          const bSameCourse = bCourse && currentCourse && bCourse.level === currentCourse.level && bCourse.subject === currentCourse.subject;

          if (aSameCourse && !bSameCourse) return -1;
          if (!aSameCourse && bSameCourse) return 1;

          return a.name.localeCompare(b.name);
      });
      return sorted;
  }, [allClasses, classData.id, classData.courseId, allCourses]);

  const periodsForSelectedSourceClass = useMemo(() => {
      const sourceClass = allClasses.find(c => c.id === selectedSourceClassId);
      if (!sourceClass) return [];

      return evaluationPeriods.filter(p => {
          // Check if this period has categories in the source class
          return sourceClass.categories.some(c => c.evaluationPeriodId === p.id);
      }).filter(p => {
          // Don't allow copying from self to self (same period)
          if (sourceClass.id === classData.id && p.id === activePeriodId) return false;
          return true;
      });
  }, [allClasses, selectedSourceClassId, evaluationPeriods, classData.id, activePeriodId]);
  
  const handleCopyCategories = (sourceClassId: string, sourcePeriodId: string) => {
      setIsCopyCatOpen(false);
      
      const sourceClass = allClasses.find(c => c.id === sourceClassId);
      const sourcePeriod = evaluationPeriods.find(p => p.id === sourcePeriodId);
      const activePeriod = evaluationPeriods.find(p => p.id === activePeriodId);
      
      if (!sourceClass || !sourcePeriod || !activePeriod) return;
  
      const message = sourceClass.id === classData.id
        ? `¿Seguro que quieres copiar todas las categorías de "${sourcePeriod.name}" a "${activePeriod.name}"?`
        : `¿Seguro que quieres copiar las categorías de "${sourceClass.name} - ${sourcePeriod.name}" a tu clase actual?`;

      if (!window.confirm(message)) return;
  
      const sourceCategories = sourceClass.categories.filter(c => c.evaluationPeriodId === sourcePeriodId);
      const currentCategoryNames = new Set(categoriesForPeriod.map(c => c.name.toLowerCase()));
      const categoriesToCopy = sourceCategories.filter(sc => !currentCategoryNames.has(sc.name.toLowerCase()));
      
      if (categoriesToCopy.length !== sourceCategories.length) {
          alert("Algunas categorías no se copiaron porque ya existen nombres idénticos en este periodo.");
      }
      
      if (categoriesToCopy.length === 0) {
          if (sourceCategories.length > 0) return; 
          alert("No hay categorías para copiar en la evaluación seleccionada.");
          return;
      }
  
      const newCategories = categoriesToCopy.map(cat => ({
          ...cat,
          id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          evaluationPeriodId: activePeriodId,
      }));
  
      onUpdateClass({ ...classData, categories: [...classData.categories, ...newCategories] });
  };

  // Wrapper to inject the source assignment
  const handleCopyAssignmentModalSubmit = (targetClassId: string, targetPeriodId: string, targetCategoryId: string) => {
      if (assignmentToCopy) {
          onCopyAssignment(assignmentToCopy, targetClassId, targetPeriodId, targetCategoryId);
      }
  };

  // Prepare sorted list of classes for tabs
  const sortedAcademicClasses = useMemo(() => {
      const academicCourseIds = new Set(allCourses.filter(c => c.type !== 'other').map(c => c.id));
      return allClasses.filter(c => academicCourseIds.has(c.courseId)).sort((a, b) => a.name.localeCompare(b.name));
  }, [allClasses, allCourses]);

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* HEADER: Removed sticky here to allow scrolling if needed, minimizing overlap risk */}
      <div className="border-b flex flex-col md:flex-row justify-between items-end md:items-center bg-white rounded-t-xl">
        {/* LEFT: Class Tabs */}
        <div className="flex overflow-x-auto no-scrollbar max-w-full md:max-w-[60%] px-2 pt-2">
            {sortedAcademicClasses.map(cls => (
                <button
                    key={cls.id}
                    onClick={() => setActiveClassId && setActiveClassId(cls.id)}
                    className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                        cls.id === classData.id 
                        ? 'border-blue-600 text-blue-700 bg-blue-50/50' 
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                >
                    {cls.name}
                </button>
            ))}
        </div>

        {/* RIGHT: Evaluation Period Tabs */}
        <div className="flex items-center space-x-1 p-1 px-2 overflow-x-auto no-scrollbar max-w-full">
          {evaluationPeriods.map(p => (
            <button 
                key={p.id} 
                onClick={() => setActivePeriodId(p.id)} 
                className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-all ${
                    activePeriodId === p.id 
                    ? 'bg-blue-100 text-blue-800 shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
                {p.name}
            </button>
          ))}
          <button 
            onClick={() => setActivePeriodId('final')} 
            className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-all ${
                activePeriodId === 'final' 
                ? 'bg-amber-100 text-amber-800 shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Final
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          {/* Fix: Header set to sticky top-0 to stick to the very top of scroll view area */}
          <thead className="text-xs text-slate-700 uppercase bg-slate-100 sticky top-0 z-20 shadow-sm">
            <tr>
              {/* Alumno Header Top Half: No bottom border, align bottom */}
              <th scope="col" className={`px-4 py-3 font-semibold sticky left-0 bg-slate-200 z-30 w-52 text-center border-r border-slate-300 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] ${activePeriodId !== 'final' ? 'border-b-0 align-bottom' : 'align-middle'}`}>
                  Alumn@
              </th>
              {activePeriodId === 'final' ? (
                <>
                  {evaluationPeriods.map(p => <th key={p.id} className="p-3 font-semibold text-center">{p.name}</th>)}
                  <th className="p-3 font-semibold text-center">Nota Final</th>
                </>
              ) : (
                <>
                  {categoriesForPeriod.map(cat => {
                    const assignmentsForCat = assignmentsForPeriod.filter(a => a.categoryId === cat.id);
                    return (
                      <th key={cat.id} colSpan={assignmentsForCat.length || 1} className="p-3 font-semibold text-center border-l border-r-2 border-r-slate-400 bg-slate-200 align-top">
                        <div className="flex justify-center items-center">
                            {cat.name} ({cat.weight}%)
                            {cat.type === 'recovery' && <span className="ml-2 text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full" title="Categoría de Recuperación">REC</span>}
                        </div>
                        <div className="flex justify-center items-center gap-1 mt-1 font-normal normal-case">
                            <button onClick={() => { setActiveCategory(cat); setAssignmentToEdit(null); setIsAssignmentModalOpen(true); }} className="p-1 text-blue-600 hover:bg-blue-100 rounded-md text-xs">Añadir Tarea</button>
                            <button onClick={() => {setCategoryToEdit(cat); setIsCategoryModalOpen(true);}} className="p-1 hover:bg-slate-300 rounded-full"><PencilIcon className="w-3 h-3 text-slate-500"/></button>
                            <button onClick={() => handleDeleteCategory(cat.id)} className="p-1 hover:bg-slate-300 rounded-full"><TrashIcon className="w-3 h-3 text-red-500"/></button>
                        </div>
                      </th>
                    )
                  })}
                  <th rowSpan={2} className="p-3 font-semibold text-center bg-slate-200 border-l align-middle relative">
                    Nota Ev.
                    <button
                        onClick={() => { setCategoryToEdit(null); setIsCategoryModalOpen(true); }}
                        className="absolute top-1 right-1 inline-flex items-center justify-center p-1.5 border border-transparent shadow-sm text-xs font-medium rounded-full text-white bg-green-600 hover:bg-green-700"
                        title="Nueva Categoría"
                    >
                        <PlusIcon className="w-4 h-4" />
                    </button>
                  </th>
                </>
              )}
            </tr>
            {activePeriodId !== 'final' && (
              <tr>
                {/* Alumno Header Bottom Half: No top border, align top (visually merges with above) */}
                <th className="px-4 py-3 sticky left-0 bg-slate-200 z-30 w-52 border-r border-slate-300 border-t-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"></th>
                
                {categoriesForPeriod.map(cat => {
                    const assignmentsForCat = assignmentsForPeriod.filter(a => a.categoryId === cat.id);
                    if (assignmentsForCat.length === 0) {
                        return <th key={`${cat.id}-empty`} className="p-2 border-l border-r-2 border-r-slate-400"></th>
                    }
                    return assignmentsForCat.map((a, idx) => (
                        <th key={a.id} className={`p-2 font-normal text-center border-l ${idx === assignmentsForCat.length - 1 ? 'border-r-2 border-r-slate-400' : 'border-r'} min-w-[120px]`} title={a.name}>
                          <div className="truncate w-full mx-auto px-1">{a.name}</div>
                          <div className="flex justify-center items-center gap-1 mt-1">
                            <button onClick={() => handleEditAssignment(a)} className="p-1 hover:bg-slate-200 rounded-full"><PencilIcon className="w-3 h-3"/></button>
                            <button onClick={() => handleDeleteAssignment(a.id)} className="p-1 hover:bg-slate-200 rounded-full"><TrashIcon className="w-3 h-3 text-red-500"/></button>
                            <button onClick={() => setAssignmentToCopy(a)} className="p-1 hover:bg-slate-200 rounded-full" title="Copiar tarea a otra clase"><DocumentDuplicateIcon className="w-3 h-3 text-slate-600"/></button>
                            <button onClick={() => {setAssignmentForImport(a); setIsBulkImportModalOpen(true);}} className="p-1 hover:bg-slate-200 rounded-full" title="Importar notas en lote"><ArrowUpTrayIcon className="w-3 h-3 text-blue-500"/></button>
                          </div>
                        </th>
                    ))
                })}
              </tr>
            )}
          </thead>
          <tbody>
            {classData.students.map((student, index) => (
              <tr key={student.id} className="bg-white border-b hover:bg-slate-50/50">
                {/* Fix: Ensure student cell has z-10 to slide UNDER the sticky header (z-30) but over standard cells if scrolling horizontal */}
                <td className="px-3 py-2 font-medium text-slate-900 sticky left-0 bg-white hover:bg-slate-50/50 z-10 w-52 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] group">
                    <div className="flex items-center gap-1 w-full">
                        <span className="text-xs text-slate-400 w-5 text-right font-mono shrink-0 mr-1">{index + 1}</span>
                        <button 
                            onClick={() => setSelectedStudentForSummary(student)}
                            className="flex items-center gap-2 text-left w-full hover:text-blue-600 transition-colors group-hover:underline truncate"
                        >
                            <AcneaeTag tags={student.acneae}/> 
                            <span className="truncate" title={student.name}>{student.name}</span>
                        </button>
                    </div>
                </td>
                {activePeriodId === 'final' ? (
                  <>
                    {evaluationPeriods.map(p => {
                       const periodGrade = studentPeriodGrades.get(student.id)?.get(p.id);
                       return <td key={p.id} className={`p-2 text-center font-bold text-base ${periodGrade?.styleClasses}`}>{periodGrade?.grade?.toFixed(2) ?? '-'}</td>
                    })}
                    <td className={`p-2 text-center font-extrabold text-lg ${studentOverallFinalGrades.get(student.id)?.styleClasses}`}>{studentOverallFinalGrades.get(student.id)?.grade}</td>
                  </>
                ) : (
                  <>
                    {categoriesForPeriod.map(cat => {
                      const assignmentsForCat = assignmentsForPeriod.filter(a => a.categoryId === cat.id);
                       if (assignmentsForCat.length === 0) {
                          return <td key={`${cat.id}-empty-cell`} className="p-2 border-l border-r-2 border-r-slate-400"></td>
                      }
                      return assignmentsForCat.map((a, idx) => {
                        const score = studentAssignmentScores.get(student.id)?.get(a.id);
                        const style = getGradeStyleClasses(score ?? null);
                        return (
                          <td key={a.id} className={`p-2 text-center font-bold text-base cursor-pointer hover:bg-blue-50 border-l ${idx === assignmentsForCat.length - 1 ? 'border-r-2 border-r-slate-400' : 'border-r'} ${style.bg} ${style.text}`} onClick={() => handleOpenGradeEntry(student, a)}>
                            {score?.toFixed(2) ?? '-'}
                          </td>
                        )
                      })
                    })}
                    <td className={`p-2 text-center font-bold text-base bg-slate-100 border-l ${studentPeriodGrades.get(student.id)?.get(activePeriodId)?.styleClasses}`}>
                      {studentPeriodGrades.get(student.id)?.get(activePeriodId)?.grade?.toFixed(2) ?? '-'}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       {activePeriodId !== 'final' && (
          <div className="p-4 border-t flex justify-start items-center bg-slate-50/50 rounded-b-xl">
            <div className="relative" ref={copyCatRef}>
              <button 
                onClick={() => setIsCopyCatOpen(prev => !prev)} 
                disabled={evaluationPeriods.length <= 1 && allClasses.length <= 1} // Basic disable check, simplified
                className="text-xs font-semibold text-slate-600 hover:bg-slate-200 p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  Copiar categorías desde...
              </button>
              {isCopyCatOpen && (
                <div className="absolute bottom-full mb-2 w-80 bg-white shadow-lg border rounded-md p-2 z-20">
                    <div className="mb-2 pb-2 border-b">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Clase de origen:</label>
                        <select 
                            className="w-full text-sm border-slate-300 rounded-md p-1"
                            value={selectedSourceClassId}
                            onChange={(e) => setSelectedSourceClassId(e.target.value)}
                        >
                            {sortedClassesForCopy.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Periodo a copiar:</label>
                        {periodsForSelectedSourceClass.length > 0 ? (
                            periodsForSelectedSourceClass.map(p => (
                                <button 
                                    key={p.id} 
                                    onClick={() => handleCopyCategories(selectedSourceClassId, p.id)} 
                                    className="w-full text-left text-sm px-3 py-1.5 hover:bg-slate-100 rounded-md truncate"
                                >
                                    {p.name}
                                </button>
                            ))
                        ) : (
                            <p className="text-xs text-slate-400 italic px-2 py-1">No hay categorías disponibles en esta clase/periodo para copiar.</p>
                        )}
                    </div>
                </div>
              )}
            </div>
          </div>
       )}
      {activeCategory && <AssignmentModal isOpen={isAssignmentModalOpen} onClose={() => setIsAssignmentModalOpen(false)} onSave={handleSaveAssignment} assignmentToEdit={assignmentToEdit} category={activeCategory} criteria={criteria} specificCompetences={specificCompetences} keyCompetences={keyCompetences} programmingUnits={programmingUnits} evaluationPeriods={evaluationPeriods} academicConfiguration={academicConfiguration} evaluationTools={evaluationTools} allAssignments={classData.assignments} allCategories={classData.categories} />}
      <CategoryModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} onSave={handleSaveCategory} categoryToEdit={categoryToEdit} evaluationPeriodId={activePeriodId} />
      {gradeEntryData && <GradeEntryModal isOpen={isGradeEntryModalOpen} onClose={() => setIsGradeEntryModalOpen(false)} student={gradeEntryData.student} assignment={gradeEntryData.assignment} grade={gradeEntryData.grade} criteriaList={criteria} onSave={handleSaveGrade} evaluationTools={evaluationTools} allAssignments={classData.assignments} />}
      {assignmentForImport && <BulkGradeImportModal isOpen={isBulkImportModalOpen} onClose={() => setIsBulkImportModalOpen(false)} onSave={handleBulkSaveGrades} assignment={assignmentForImport} students={classData.students} />}
      {selectedStudentForSummary && (
          <StudentSummaryModal
            isOpen={!!selectedStudentForSummary}
            onClose={() => setSelectedStudentForSummary(null)}
            student={selectedStudentForSummary}
            classData={classData}
            academicConfiguration={academicConfiguration}
            criteria={criteria}
            specificCompetences={specificCompetences}
            keyCompetences={keyCompetences}
          />
      )}
      {assignmentToCopy && (
          <CopyAssignmentModal
            isOpen={!!assignmentToCopy}
            onClose={() => setAssignmentToCopy(null)}
            sourceAssignment={assignmentToCopy}
            allClasses={allClasses}
            currentClassId={classData.id}
            academicConfiguration={academicConfiguration}
            onCopy={handleCopyAssignmentModalSubmit}
          />
      )}
    </div>
  );
};

export default GradebookTable;
