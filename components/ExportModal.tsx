
import React, { useState, useMemo } from 'react';
import Modal from './Modal';
import type { ClassData, Course, KeyCompetence, SpecificCompetence, EvaluationCriterion, AcademicConfiguration, ProgrammingUnit, BasicKnowledge } from '../types';
import { calculateEvaluationPeriodGradeForStudent, calculateOverallFinalGradeForStudent, calculateStudentCriterionGrades, calculateStudentCompetenceGrades, calculateStudentKeyCompetenceGrades } from '../services/gradeCalculations';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    classes: ClassData[];
    courses: Course[];
    keyCompetences: KeyCompetence[];
    specificCompetences: SpecificCompetence[];
    evaluationCriteria: EvaluationCriterion[];
    programmingUnits: ProgrammingUnit[];
    basicKnowledge: BasicKnowledge[];
    academicConfiguration: AcademicConfiguration;
}

const downloadCsv = (content: string, filename: string) => {
    // Add BOM for Excel compatibility with UTF-8
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const escapeCsvCell = (cell: any): string => {
    const cellStr = String(cell ?? '').replace(/"/g, '""');
    return `"${cellStr}"`;
};

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, classes, courses, keyCompetences, specificCompetences, evaluationCriteria, programmingUnits, basicKnowledge, academicConfiguration }) => {
    const [selectedClassIds, setSelectedClassIds] = useState<Set<string>>(new Set(classes.map(c => c.id)));

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedClassIds(new Set(classes.map(c => c.id)));
        } else {
            setSelectedClassIds(new Set());
        }
    };

    const handleClassSelection = (classId: string, checked: boolean) => {
        const newSelection = new Set(selectedClassIds);
        if (checked) {
            newSelection.add(classId);
        } else {
            newSelection.delete(classId);
        }
        setSelectedClassIds(newSelection);
    };

    const handleExport = () => {
        const classesToExport = classes.filter(c => selectedClassIds.has(c.id));
        if (classesToExport.length === 0) {
            alert("Selecciona al menos una clase para exportar.");
            return;
        }

        for (const classData of classesToExport) {
            const course = courses.find(c => c.id === classData.courseId);
            if (!course) continue;

            const classCriteria = evaluationCriteria.filter(c => c.courseId === course.id);
            const classCompetences = specificCompetences.filter(sc => classCriteria.some(c => c.competenceId === sc.id));
            const classNameSanitized = classData.name.replace(/ /g, '_');
            const { evaluationPeriods } = academicConfiguration;

            // 1. Gradebook CSV
            const gradebookHeaders = ['Alumn@', ...evaluationPeriods.map(p => p.name), 'Nota Final de Curso'];
            const gradebookRows = classData.students.map(student => {
                const row = [student.name];
                evaluationPeriods.forEach(p => {
                    const periodGrade = calculateEvaluationPeriodGradeForStudent(student.id, classData, p.id);
                    row.push(periodGrade.grade?.toFixed(2) ?? '');
                });
                const finalGrade = calculateOverallFinalGradeForStudent(student.id, classData, academicConfiguration);
                row.push(finalGrade.grade);
                return row;
            });
            const gradebookCsv = [gradebookHeaders, ...gradebookRows].map(row => row.map(escapeCsvCell).join(',')).join('\n');
            downloadCsv(gradebookCsv, `${classNameSanitized}_Calificaciones_Finales.csv`);

            // 2. Criteria Report CSV
            evaluationPeriods.forEach(period => {
                const criteriaHeaders = ['Alumn@', ...classCriteria.map(c => c.code)];
                const criteriaRows = classData.students.map(student => {
                    // FIX: Corrected the arguments passed to calculateStudentCriterionGrades.
                    const studentGrades = calculateStudentCriterionGrades(student.id, classData, classCriteria, period.id);
                    return [student.name, ...classCriteria.map(c => studentGrades.get(c.id)?.toFixed(2) ?? '')];
                });
                const criteriaCsv = [criteriaHeaders, ...criteriaRows].map(row => row.map(escapeCsvCell).join(',')).join('\n');
                downloadCsv(criteriaCsv, `${classNameSanitized}_Informe_Criterios_${period.name.replace(/ /g, '_')}.csv`);
            });


            // 3. Specific Competences Report CSV
            evaluationPeriods.forEach(period => {
                const scHeaders = ['Alumn@', ...classCompetences.map(c => c.code)];
                const scRows = classData.students.map(student => {
                    // FIX: Corrected the arguments passed to calculateStudentCompetenceGrades.
                    const studentGrades = calculateStudentCompetenceGrades(student.id, classData, classCriteria, classCompetences, period.id);
                    return [student.name, ...classCompetences.map(c => studentGrades.get(c.id)?.toFixed(2) ?? '')];
                });
                const scCsv = [scHeaders, ...scRows].map(row => row.map(escapeCsvCell).join(',')).join('\n');
                downloadCsv(scCsv, `${classNameSanitized}_Informe_Comp_Especificas_${period.name.replace(/ /g, '_')}.csv`);
            });
            
            // 4. Key Competences Report CSV
             evaluationPeriods.forEach(period => {
                const kcHeaders = ['Alumn@', ...keyCompetences.map(kc => kc.code)];
                const kcRows = classData.students.map(student => {
                     // FIX: Corrected the arguments passed to calculateStudentKeyCompetenceGrades.
                     const studentGrades = calculateStudentKeyCompetenceGrades(student.id, classData, classCriteria, classCompetences, keyCompetences, period.id);
                    return [student.name, ...keyCompetences.map(kc => studentGrades.get(kc.id)?.toFixed(2) ?? '')];
                });
                const kcCsv = [kcHeaders, ...kcRows].map(row => row.map(escapeCsvCell).join(',')).join('\n');
                downloadCsv(kcCsv, `${classNameSanitized}_Informe_Comp_Clave_${period.name.replace(/ /g, '_')}.csv`);
            });

            // 5. Planning CSV
            const classUnits = programmingUnits.filter(u => u.courseId === course.id);
            if (classUnits.length > 0) {
                const planningHeaders = ['Unidad Didáctica', 'Nº Sesión', 'Descripción/Contenido', 'Criterios Vinculados', 'Saberes Básicos Vinculados'];
                const planningRows: (string | number)[][] = [];
                
                classUnits.forEach(unit => {
                    const criteriaCodes = unit.linkedCriteriaIds
                        .map(id => evaluationCriteria.find(c => c.id === id)?.code)
                        .filter(Boolean).join('; ');
                    const knowledgeCodes = unit.linkedBasicKnowledgeIds
                        .map(id => basicKnowledge.find(sb => sb.id === id)?.code)
                        .filter(Boolean).join('; ');

                    if ((unit.sessionDetails || []).length > 0) {
                        unit.sessionDetails.forEach((session, index) => {
                            planningRows.push([
                                unit.name,
                                index + 1,
                                session.description,
                                criteriaCodes,
                                knowledgeCodes
                            ]);
                        });
                    }
                });
                
                const planningCsv = [planningHeaders, ...planningRows].map(row => row.map(escapeCsvCell).join(',')).join('\n');
                downloadCsv(planningCsv, `Planificacion_${classNameSanitized}.csv`);
            }
        }
        
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Exportar Calificaciones e Informes" size="lg">
            <div className="space-y-4">
                <div>
                    <h3 className="text-md font-semibold text-slate-800 mb-2">Seleccionar Clases</h3>
                    <div className="p-3 border rounded-lg max-h-60 overflow-y-auto space-y-2">
                        <label className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded-md">
                            <input
                                type="checkbox"
                                checked={selectedClassIds.size === classes.length}
                                onChange={(e) => handleSelectAll(e.target.checked)}
                                className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span className="font-semibold">Seleccionar Todo</span>
                        </label>
                        <hr/>
                        {classes.map(c => (
                            <label key={c.id} className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded-md">
                                <input
                                    type="checkbox"
                                    checked={selectedClassIds.has(c.id)}
                                    onChange={(e) => handleClassSelection(c.id, e.target.checked)}
                                    className="rounded text-blue-600 focus:ring-blue-500"
                                />
                                <span>{c.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <p className="text-xs text-slate-500">
                    Se descargarán múltiples archivos CSV por cada clase seleccionada: un resumen de calificaciones, un informe de planificación y un informe detallado por cada periodo de evaluación.
                </p>

                <div className="flex justify-end pt-4 space-x-2 border-t mt-4">
                    <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleExport}
                        disabled={selectedClassIds.size === 0}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                    >
                        Exportar a CSV
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ExportModal;
