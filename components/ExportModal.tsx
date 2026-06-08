
import React, { useState } from 'react';
import Modal from './Modal';
import JSZip from 'jszip/dist/jszip.min.js';
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

const escapeCsvCell = (cell: any): string => {
    const cellStr = String(cell ?? '').replace(/"/g, '""');
    return `"${cellStr}"`;
};

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, classes, courses, keyCompetences, specificCompetences, evaluationCriteria, programmingUnits, basicKnowledge, academicConfiguration }) => {
    const [selectedClassIds, setSelectedClassIds] = useState<Set<string>>(new Set(classes.map(c => c.id)));
    const [isGenerating, setIsGenerating] = useState(false);
    
    // New selected elements state
    const [includeFinalGrades, setIncludeFinalGrades] = useState(true);
    const [includePlanning, setIncludePlanning] = useState(true);
    const [includeFinalCourseReport, setIncludeFinalCourseReport] = useState(true);
    const [selectedPeriodIds, setSelectedPeriodIds] = useState<Set<string>>(new Set(academicConfiguration.evaluationPeriods.map(p => p.id)));

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

    const handlePeriodSelection = (periodId: string, checked: boolean) => {
        const newSelection = new Set(selectedPeriodIds);
        if (checked) {
            newSelection.add(periodId);
        } else {
            newSelection.delete(periodId);
        }
        setSelectedPeriodIds(newSelection);
    };

    const handleExport = async () => {
        const classesToExport = classes.filter(c => selectedClassIds.has(c.id));
        if (classesToExport.length === 0) {
            alert("Selecciona al menos una clase para exportar.");
            return;
        }

        const periodsToExport = academicConfiguration.evaluationPeriods.filter(p => selectedPeriodIds.has(p.id));
        const hasWorkSelected = includeFinalGrades || includePlanning || includeFinalCourseReport || periodsToExport.length > 0;

        if (!hasWorkSelected) {
            alert("Por favor, selecciona al menos un tipo de informe para exportar.");
            return;
        }

        setIsGenerating(true);
        const zip = new JSZip();
        // BOM for Excel compatibility with UTF-8
        const bom = "\uFEFF";

        for (const classData of classesToExport) {
            const course = courses.find(c => c.id === classData.courseId);
            if (!course) continue;

            const classFolder = zip.folder(classData.name);
            if (!classFolder) continue;

            const classCriteria = evaluationCriteria.filter(c => c.courseId === course.id);
            const classCompetences = specificCompetences.filter(sc => classCriteria.some(c => c.competenceId === sc.id));
            const classNameSanitized = classData.name.replace(/ /g, '_');
            const { evaluationPeriods } = academicConfiguration;

            // 1. Gradebook CSV (Final Grades Summary)
            if (includeFinalGrades) {
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
                const gradebookCsvContent = [gradebookHeaders, ...gradebookRows].map(row => row.map(escapeCsvCell).join(',')).join('\n');
                classFolder.file(`${classNameSanitized}_Calificaciones_Finales.csv`, bom + gradebookCsvContent);
            }

            // Report per selected period
            const periodsToIterate = includeFinalCourseReport 
                ? [...periodsToExport, { id: 'FINAL', name: 'Curso Completo' }]
                : periodsToExport;

            for (const period of periodsToIterate) {
                const evalPeriodId = period.id === 'FINAL' ? undefined : period.id;

                // 2. Criteria Report CSV
                const criteriaHeaders = ['Alumn@', ...classCriteria.map(c => c.code)];
                const criteriaRows = classData.students.map(student => {
                    const studentGrades = calculateStudentCriterionGrades(student.id, classData, classCriteria, academicConfiguration, evalPeriodId);
                    return [student.name, ...classCriteria.map(c => studentGrades.get(c.id)?.toFixed(2) ?? '')];
                });
                const criteriaCsvContent = [criteriaHeaders, ...criteriaRows].map(row => row.map(escapeCsvCell).join(',')).join('\n');
                classFolder.file(`${classNameSanitized}_Informe_Criterios_${period.name.replace(/ /g, '_')}.csv`, bom + criteriaCsvContent);

                // 3. Specific Competences Report CSV
                const scHeaders = ['Alumn@', ...classCompetences.map(c => c.code)];
                const scRows = classData.students.map(student => {
                    const studentGrades = calculateStudentCompetenceGrades(student.id, classData, classCriteria, classCompetences, academicConfiguration, evalPeriodId);
                    return [student.name, ...classCompetences.map(c => studentGrades.get(c.id)?.toFixed(2) ?? '')];
                });
                const scCsvContent = [scHeaders, ...scRows].map(row => row.map(escapeCsvCell).join(',')).join('\n');
                classFolder.file(`${classNameSanitized}_Informe_Comp_Especificas_${period.name.replace(/ /g, '_')}.csv`, bom + scCsvContent);
                
                // 4. Key Competences Report CSV
                const kcHeaders = ['Alumn@', ...keyCompetences.map(kc => kc.code)];
                const kcRows = classData.students.map(student => {
                        const studentGrades = calculateStudentKeyCompetenceGrades(student.id, classData, classCriteria, classCompetences, keyCompetences, academicConfiguration, evalPeriodId);
                    return [student.name, ...keyCompetences.map(kc => studentGrades.get(kc.id)?.toFixed(2) ?? '')];
                });
                const kcCsvContent = [kcHeaders, ...kcRows].map(row => row.map(escapeCsvCell).join(',')).join('\n');
                classFolder.file(`${classNameSanitized}_Informe_Comp_Clave_${period.name.replace(/ /g, '_')}.csv`, bom + kcCsvContent);
            }

            // 5. Planning CSV
            if (includePlanning) {
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
                    
                    const planningCsvContent = [planningHeaders, ...planningRows].map(row => row.map(escapeCsvCell).join(',')).join('\n');
                    classFolder.file(`Planificacion_${classNameSanitized}.csv`, bom + planningCsvContent);
                }
            }
        }
        
        try {
            const content = await zip.generateAsync({ type: "blob" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(content);
            link.download = `Informes_Cuaderno_${new Date().toISOString().split('T')[0]}.zip`;
            link.click();
            URL.revokeObjectURL(link.href);
            onClose();
        } catch (error) {
            console.error("Error generating ZIP:", error);
            alert("Error al generar el archivo comprimido.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Exportar Calificaciones e Informes" size="lg">
            <div className="space-y-6">
                {/* Section: Classes */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-2 uppercase tracking-wider">1. Seleccionar Clases</h3>
                    <div className="p-3 border border-slate-200 rounded-lg max-h-48 overflow-y-auto space-y-1 bg-slate-50/50">
                        <label className="flex items-center space-x-2 p-2 hover:bg-white hover:shadow-sm rounded-md transition-all cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedClassIds.size === classes.length}
                                onChange={(e) => handleSelectAll(e.target.checked)}
                                className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span className="font-semibold text-slate-700">Seleccionar Todo</span>
                        </label>
                        <hr className="my-1 border-slate-200"/>
                        {classes.map(c => (
                            <label key={c.id} className="flex items-center space-x-2 p-2 hover:bg-white hover:shadow-sm rounded-md transition-all cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedClassIds.has(c.id)}
                                    onChange={(e) => handleClassSelection(c.id, e.target.checked)}
                                    className="rounded text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-slate-600">{c.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Section: Elements to include */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-2 uppercase tracking-wider">2. Elementos a incluir</h3>
                    <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <label className="flex items-center space-x-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={includeFinalGrades}
                                onChange={(e) => setIncludeFinalGrades(e.target.checked)}
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                            />
                            <div>
                                <span className="block font-medium text-slate-700 group-hover:text-blue-600 transition-colors">Resumen de Calificaciones</span>
                                <span className="text-xs text-slate-500">Un solo archivo con las notas finales y por periodos de todos los alumnos.</span>
                            </div>
                        </label>

                        <label className="flex items-center space-x-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={includePlanning}
                                onChange={(e) => setIncludePlanning(e.target.checked)}
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                            />
                            <div>
                                <span className="block font-medium text-slate-700 group-hover:text-blue-600 transition-colors">Planificación Didáctica</span>
                                <span className="text-xs text-slate-500">Detalle de unidades, sesiones, criterios y saberes vinculados.</span>
                            </div>
                        </label>

                        <div className="pt-2 border-t border-slate-200">
                            <span className="block text-sm font-semibold text-slate-700 mb-2">Informes de Evaluación por Periodo:</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {academicConfiguration.evaluationPeriods.map(p => (
                                    <label key={p.id} className="flex items-center space-x-2 p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all cursor-pointer border border-transparent hover:border-slate-200">
                                        <input
                                            type="checkbox"
                                            checked={selectedPeriodIds.has(p.id)}
                                            onChange={(e) => handlePeriodSelection(p.id, e.target.checked)}
                                            className="rounded text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-slate-600">{p.name}</span>
                                    </label>
                                ))}
                                <label className="flex items-center space-x-2 p-2 hover:bg-slate-100 hover:shadow-sm rounded-lg transition-all cursor-pointer border border-slate-200 bg-slate-50">
                                    <input
                                        type="checkbox"
                                        checked={includeFinalCourseReport}
                                        onChange={(e) => setIncludeFinalCourseReport(e.target.checked)}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-slate-700">Curso Completo (Final)</span>
                                </label>
                            </div>
                            <p className="mt-2 text-[10px] text-slate-400 italic">
                                * Cada periodo seleccionado generará informes detallados de criterios y competencias.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-start gap-3">
                    <div className="p-1 bg-blue-100 rounded-full">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-xs text-blue-700 leading-relaxed">
                        Se generará un único archivo comprimido <strong>.zip</strong> organizado por carpetas para cada clase seleccionada.
                    </p>
                </div>

                <div className="flex justify-end pt-4 space-x-2 border-t">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        disabled={isGenerating}
                        className="bg-white py-2 px-4 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleExport}
                        disabled={selectedClassIds.size === 0 || isGenerating}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 min-w-[140px]"
                    >
                        {isGenerating ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generando...
                            </span>
                        ) : 'Descargar ZIP'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ExportModal;
