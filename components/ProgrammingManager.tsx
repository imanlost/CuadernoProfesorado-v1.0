
import React, { useState, useEffect, useMemo } from 'react';
import type { ProgrammingUnit, Course, SessionDetail, EvaluationCriterion, BasicKnowledge, ClassData, AcademicConfiguration } from '../types';
import { PencilIcon, TrashIcon, PlusIcon, ArrowUpIcon, ArrowDownIcon, ArrowUpTrayIcon } from './Icons';
import Modal from './Modal';

interface ProgrammingManagerProps {
    courses: Course[];
    units: ProgrammingUnit[];
    setUnits: (updater: (prev: ProgrammingUnit[]) => ProgrammingUnit[]) => void;
    criteria: EvaluationCriterion[];
    basicKnowledge: BasicKnowledge[];
    classes: ClassData[];
    academicConfiguration: AcademicConfiguration;
}

const toYYYYMMDD = (date: Date): string => {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
};

const addDays = (date: Date, days: number): Date => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
};


const ProgrammingManager: React.FC<ProgrammingManagerProps> = ({ courses, units, setUnits, criteria, basicKnowledge, classes, academicConfiguration }) => {
    const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');
    const [unitEditorState, setUnitEditorState] = useState<{ mode: 'create' } | { mode: 'edit', unit: ProgrammingUnit } | null>(null);
    const [showImportHelp, setShowImportHelp] = useState(false);

    const selectedCourse = useMemo(() => courses.find(c => c.id === selectedCourseId), [courses, selectedCourseId]);
    
    const filteredUnits = useMemo(() => units.filter(u => u.courseId === selectedCourseId), [units, selectedCourseId]);
    const filteredCriteria = useMemo(() => criteria.filter(c => c.courseId === selectedCourseId), [criteria, selectedCourseId]);
    const filteredBasicKnowledge = useMemo(() => basicKnowledge.filter(sb => sb.courseId === selectedCourseId), [basicKnowledge, selectedCourseId]);

    const unitDateRanges = useMemo(() => {
        const ranges = new Map<string, { start?: Date, end?: Date }>();
        if (!selectedCourseId || !classes || !academicConfiguration?.academicYearStart || !academicConfiguration.academicYearEnd) return ranges;

        const isHoliday = (date: Date): boolean => {
            if (!academicConfiguration?.holidays) return false;
            const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            return academicConfiguration.holidays.some(h => {
                const start = new Date(h.startDate + 'T00:00:00');
                const end = new Date(h.endDate + 'T00:00:00');
                return dateOnly >= start && dateOnly <= end;
            });
        };

        const unitsForCourse = units.filter(u => u.courseId === selectedCourseId);
        const classesForCourse = classes.filter(c => c.courseId === selectedCourseId);
        
        // We calculate valid school dates first
        const schoolDays: Date[] = [];
        let currentDateIterator = new Date(academicConfiguration.academicYearStart + 'T00:00:00');
        const endDate = new Date(academicConfiguration.academicYearEnd + 'T00:00:00');
        
        while (currentDateIterator <= endDate) {
            const dayOfWeek = currentDateIterator.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isHoliday(currentDateIterator)) {
                schoolDays.push(new Date(currentDateIterator));
            }
            currentDateIterator = addDays(currentDateIterator, 1);
        }

        // For simplicity in calculation, we assume the first class's schedule as the "master" timeline
        const classData = classesForCourse[0]; 
        if (!classData || !classData.schedule || classData.schedule.length === 0) return ranges;

        const skippedDaysSet = new Set(classData.skippedDays || []);
        const validSessionDates: Date[] = [];

        schoolDays.forEach(schoolDay => {
            const slotsForThisDay = (classData.schedule || []).filter(slot => slot.day === schoolDay.getDay());
            if (slotsForThisDay.length > 0 && !skippedDaysSet.has(toYYYYMMDD(schoolDay))) {
                // Add one entry per slot. We treat sessions as linear.
                for (let i = 0; i < slotsForThisDay.length; i++) {
                    validSessionDates.push(schoolDay);
                }
            }
        });

        // Now map units to dates using the Anchor logic
        let currentSessionIndex = 0;

        unitsForCourse.forEach((unit, unitIndex) => {
            let startSessionIndex = currentSessionIndex;

            // Check for Anchor (Fixed Start Date)
            if (unit.startDate) {
                const anchorDateStr = unit.startDate;
                // Find the index in validSessionDates that corresponds to or follows the anchor date
                const anchorIndex = validSessionDates.findIndex(d => toYYYYMMDD(d) >= anchorDateStr);
                
                if (anchorIndex !== -1) {
                    if (anchorIndex > currentSessionIndex) {
                        // GAP DETECTED: Extend the PREVIOUS unit to fill the gap.
                        if (unitIndex > 0) {
                            const prevUnitId = unitsForCourse[unitIndex - 1].id;
                            const prevRange = ranges.get(prevUnitId);
                            if (prevRange && prevRange.start) {
                                const extendedEndIndex = anchorIndex - 1;
                                const extendedEndDate = validSessionDates[extendedEndIndex];
                                ranges.set(prevUnitId, { start: prevRange.start, end: extendedEndDate });
                            }
                        }
                        startSessionIndex = anchorIndex;
                    } else {
                        // Overlap or sequential match, enforce anchor
                        startSessionIndex = anchorIndex;
                    }
                }
            }

            const sessionsCount = unit.sessions;
            // Ensure we don't go out of bounds
            if (startSessionIndex < validSessionDates.length) {
                const endSessionIndex = Math.min(startSessionIndex + sessionsCount - 1, validSessionDates.length - 1);
                
                const startDate = validSessionDates[startSessionIndex];
                const endDate = validSessionDates[endSessionIndex];
                
                ranges.set(unit.id, { start: startDate, end: endDate });
                
                // Prepare cursor for next unit
                currentSessionIndex = endSessionIndex + 1;
            }
        });

        return ranges;
    }, [selectedCourseId, classes, academicConfiguration, units]);


    const handleSave = (unit: ProgrammingUnit) => {
        if (unitEditorState?.mode === 'edit') {
            setUnits(prev => prev.map(u => u.id === unit.id ? unit : u));
        } else { // create
             const newUnit: ProgrammingUnit = {
                ...unit,
                id: `pu-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                courseId: selectedCourseId,
            };
            setUnits(prev => [...prev, newUnit]);
        }
        setUnitEditorState(null);
    };
    
    const handleDelete = (unitId: string) => {
        if (window.confirm("¿Seguro que quieres eliminar esta unidad de programación?")) {
            setUnits(prev => prev.filter(u => u.id !== unitId));
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const text = reader.result;
            if (typeof text === 'string') {
                parseAndImportCSV(text);
            }
        };
        reader.readAsText(file);
        if (event.target) event.target.value = '';
    };

    const parseAndImportCSV = (csvText: string) => {
        try {
            const lines = csvText.split(/\r\n|\n/).filter(line => line.trim() !== '');
            if (lines.length < 2) {
                alert("El archivo CSV parece estar vacío o no tiene datos válidos.");
                return;
            }

            // Helpers to resolve codes to IDs
            const criteriaMap = new Map<string, string>(filteredCriteria.map(c => [c.code.trim(), c.id] as [string, string]));
            const knowledgeMap = new Map<string, string>(filteredBasicKnowledge.map(k => [k.code.trim(), k.id] as [string, string]));

            const newUnits: ProgrammingUnit[] = [];

            // Skip header (index 0)
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i];
                // Basic CSV parsing handling quotes
                const parts: string[] = [];
                let currentVal = '';
                let insideQuotes = false;
                for (const char of line) {
                    if (char === '"' && insideQuotes) insideQuotes = false;
                    else if (char === '"' && !insideQuotes) insideQuotes = true;
                    else if (char === ',' && !insideQuotes) {
                        parts.push(currentVal.trim());
                        currentVal = '';
                    } else {
                        currentVal += char;
                    }
                }
                parts.push(currentVal.trim());

                // Expected Format: Name, Sessions, StartDate, Criteria, Knowledge, SessionDetails
                const [name, sessionsStr, startDate, criteriaCodes, knowledgeCodes, sessionDetailsStr] = parts;

                if (!name) continue;

                const sessions = parseInt(sessionsStr, 10) || 1;
                
                // Resolve Links
                const linkedCriteriaIds: string[] = [];
                if (criteriaCodes) {
                    criteriaCodes.replace(/^"|"$/g, '').split(',').forEach(code => {
                        const id = criteriaMap.get(code.trim());
                        if (id) linkedCriteriaIds.push(id);
                    });
                }

                const linkedBasicKnowledgeIds: string[] = [];
                if (knowledgeCodes) {
                    knowledgeCodes.replace(/^"|"$/g, '').split(',').forEach(code => {
                        const id = knowledgeMap.get(code.trim());
                        if (id) linkedBasicKnowledgeIds.push(id);
                    });
                }

                // Parse Session Details (split by pipe '|')
                let sessionDetails: SessionDetail[] = [];
                if (sessionDetailsStr) {
                    const descriptions = sessionDetailsStr.replace(/^"|"$/g, '').split('|').map(d => d.trim());
                    sessionDetails = descriptions.map(desc => ({ description: desc }));
                }

                // Adjust sessions count if details provided are more
                const finalSessions = Math.max(sessions, sessionDetails.length);
                
                // Pad session details if less than sessions count
                while (sessionDetails.length < finalSessions) {
                    sessionDetails.push({ description: '' });
                }

                const newUnit: ProgrammingUnit = {
                    id: `pu-imp-${Date.now()}-${i}`,
                    courseId: selectedCourseId,
                    name: name.replace(/^"|"$/g, ''),
                    sessions: finalSessions,
                    startDate: startDate && startDate.match(/^\d{4}-\d{2}-\d{2}$/) ? startDate : undefined,
                    linkedCriteriaIds,
                    linkedBasicKnowledgeIds,
                    sessionDetails
                };

                newUnits.push(newUnit);
            }

            if (newUnits.length > 0) {
                setUnits(prev => [...prev, ...newUnits]);
                alert(`Se han importado ${newUnits.length} unidades correctamente al curso seleccionado.`);
                setShowImportHelp(false);
            } else {
                alert("No se pudieron extraer unidades del archivo. Verifica el formato.");
            }

        } catch (error) {
            console.error("Error parsing CSV:", error);
            alert("Error al procesar el archivo CSV.");
        }
    };
    
    return (
        <>
            <div className="space-y-6">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Planificador de Unidades Didácticas</h3>
                    <p className="text-sm text-slate-600 mb-4">
                        Define la secuencia de unidades didácticas para un curso. Esta planificación se usará para generar el calendario de todas las clases de este curso.
                    </p>
                    <div className="mb-4">
                      <label htmlFor="course-plan-select" className="block text-sm font-medium text-slate-700 mb-1">Curso a planificar:</label>
                      <select id="course-plan-select" value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg">
                          <option value="" disabled>Selecciona un curso...</option>
                          {courses.map((course: Course) => (
                              <option key={course.id} value={course.id}>{course.level} - {course.subject}</option>
                          ))}
                      </select>
                    </div>
                </div>

                {selectedCourse ? (
                    <div className="bg-white rounded-xl shadow-sm border">
                        <div className="p-4 border-b flex justify-between items-center bg-slate-50/50 rounded-t-xl flex-wrap gap-2">
                            <h2 className="text-lg font-bold text-slate-800">Unidades para {selectedCourse.level} - {selectedCourse.subject}</h2>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setShowImportHelp(!showImportHelp)}
                                    className="inline-flex items-center justify-center py-2 px-3 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50"
                                >
                                    <ArrowUpTrayIcon className="w-4 h-4 mr-1"/>
                                    Importar CSV
                                </button>
                                <button onClick={() => setUnitEditorState({ mode: 'create'})} disabled={!!unitEditorState} className="inline-flex items-center justify-center py-2 px-3 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed">
                                    <PlusIcon className="w-4 h-4 mr-1"/>
                                    Nueva Unidad
                                </button>
                            </div>
                        </div>

                        {showImportHelp && (
                            <div className="p-4 bg-blue-50 border-b border-blue-100">
                                <h4 className="font-bold text-sm text-blue-800 mb-2">Instrucciones para Importar Unidades</h4>
                                <p className="text-xs text-blue-700 mb-2">
                                    Sube un archivo CSV con las siguientes columnas (respeta el orden). Los Criterios y Saberes se vincularán automáticamente si coinciden con los códigos del curso (ej. "1.1", "A.1").
                                </p>
                                <div className="bg-white p-2 rounded border border-blue-200 overflow-x-auto font-mono text-xs mb-3 text-slate-600">
                                    Nombre,Sesiones,FechaInicio,Criterios,Saberes,DetalleSesiones<br/>
                                    "Unidad 1: La Célula",6,2024-09-15,"1.1, 1.2","A.1, A.2","Introducción|Teoría Celular|Microscopio|Práctica|Repaso|Examen"<br/>
                                    "Unidad 2: Nutrición",8,,"2.1, 2.3","B.1","Intro Nutrición|Dieta equilibrada|..."
                                </div>
                                <div className="mt-3">
                                    <label className="cursor-pointer inline-flex items-center justify-center py-2 px-4 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50">
                                        <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
                                        Seleccionar Archivo CSV
                                        <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                                    </label>
                                </div>
                            </div>
                        )}

                        <div className="p-4 space-y-3">
                            {filteredUnits.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">
                                    <p>No hay unidades de programación para este curso.</p>
                                    <p>¡Añade una o impórtalas para empezar a planificar!</p>
                                </div>
                            ) : (
                                filteredUnits.map(unit => {
                                    const linkedCriteriaData = unit.linkedCriteriaIds.map(id => filteredCriteria.find(c => c.id === id)).filter((c): c is EvaluationCriterion => c !== undefined);
                                    const linkedBasicKnowledgeData = unit.linkedBasicKnowledgeIds.map(id => filteredBasicKnowledge.find(sb => sb.id === id)).filter((sb): sb is BasicKnowledge => sb !== undefined);
                                    
                                    return (
                                        <div key={unit.id} className="p-3 border rounded-lg group hover:bg-slate-50/50 transition-colors">
                                            <UnitViewer 
                                                unit={unit} 
                                                dateRange={unitDateRanges.get(unit.id)}
                                                linkedCriteria={linkedCriteriaData} 
                                                linkedBasicKnowledge={linkedBasicKnowledgeData} 
                                                onEdit={() => setUnitEditorState({ mode: 'edit', unit })} 
                                                onDelete={() => handleDelete(unit.id)} 
                                            />
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="p-8 text-center bg-white rounded-xl shadow-sm border"><p>Selecciona un curso para ver su planificación.</p></div>
                )}
            </div>
            {unitEditorState && (
                <Modal 
                    isOpen={!!unitEditorState} 
                    onClose={() => setUnitEditorState(null)} 
                    title={unitEditorState.mode === 'create' ? 'Nueva Unidad Didáctica' : 'Editar Unidad Didáctica'}
                    size="3xl"
                >
                     <UnitEditor
                        key={unitEditorState.mode === 'edit' ? unitEditorState.unit.id : 'create-new'}
                        unit={unitEditorState.mode === 'edit' ? unitEditorState.unit : {
                            id: 'new', courseId: selectedCourseId, name: '', sessions: 1,
                            sessionDetails: [{ description: '' }], linkedCriteriaIds: [], linkedBasicKnowledgeIds: [], startDate: ''
                        }}
                        onSave={handleSave}
                        onCancel={() => setUnitEditorState(null)}
                        criteria={filteredCriteria}
                        basicKnowledge={filteredBasicKnowledge}
                    />
                </Modal>
            )}
        </>
    );
};

interface UnitViewerProps {
    unit: ProgrammingUnit;
    dateRange?: { start?: Date, end?: Date };
    linkedCriteria: EvaluationCriterion[];
    linkedBasicKnowledge: BasicKnowledge[];
    onEdit: () => void;
    onDelete: () => void;
}

const UnitViewer: React.FC<UnitViewerProps> = ({ unit, dateRange, linkedCriteria, linkedBasicKnowledge, onEdit, onDelete }) => {
    const formatDateRange = () => {
        if (!dateRange || !dateRange.start || !dateRange.end) return "Fechas no calculadas";
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
        const startStr = dateRange.start.toLocaleDateString('es-ES', options);
        const endStr = dateRange.end.toLocaleDateString('es-ES', options);
        return `${startStr} - ${endStr}`;
    };

    return (
        <div className="flex items-start justify-between">
            <div>
                <h3 className="font-bold text-slate-800">{unit.name} <span className="font-normal text-sm text-slate-500">({unit.sessions} sesiones)</span></h3>
                <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full inline-block">{formatDateRange()}</p>
                    {unit.startDate && <p className="text-xs text-slate-500 italic">Inicio fijado: {unit.startDate}</p>}
                </div>
                <div className="mt-2 space-y-1">
                    <p className="text-sm font-semibold text-slate-600">Criterios:</p>
                    <div className="flex flex-wrap gap-1">
                        {linkedCriteria.map((crit) => (
                           <span key={crit.id} className="text-xs font-medium bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full" title={crit.description}>{crit.code}</span>
                        ))}
                    </div>
                </div>
                <div className="mt-2 space-y-1">
                    <p className="text-sm font-semibold text-slate-600">Saberes Básicos:</p>
                    <div className="flex flex-wrap gap-1">
                         {linkedBasicKnowledge.map((sb) => (
                            <span key={sb.id} className="text-xs font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full" title={sb.description}>{sb.code}</span>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={onEdit} className="p-2 hover:bg-slate-200 rounded-full"><PencilIcon className="w-4 h-4 text-slate-600" /></button>
                <button onClick={onDelete} className="p-2 hover:bg-red-100 rounded-full"><TrashIcon className="w-4 h-4 text-red-500" /></button>
            </div>
        </div>
    )
};

const PALETTE_COLORS = ['#89b0f3', '#7dd7b2', '#fde28a', '#f472b6', '#b6a3f9', '#ef4444'];

const UnitEditor: React.FC<{ unit: ProgrammingUnit; onSave: (unit: ProgrammingUnit) => void; onCancel: () => void; criteria: EvaluationCriterion[], basicKnowledge: BasicKnowledge[] }> = ({ unit, onSave, onCancel, criteria, basicKnowledge }) => {
    const [editedUnit, setEditedUnit] = useState(unit);

    const handleFieldChange = <K extends keyof ProgrammingUnit>(field: K, value: ProgrammingUnit[K]) => {
        setEditedUnit(prev => ({ ...prev, [field]: value }));
    };

    const handleSessionsChange = (newSessionsCount: number) => {
        const targetLength = Math.max(1, isNaN(newSessionsCount) ? 1 : newSessionsCount);
        
        setEditedUnit(prev => {
            const currentDetails = prev.sessionDetails || [];
            const currentLength = currentDetails.length;

            if (targetLength === currentLength) {
                return { ...prev, sessions: targetLength };
            }

            let newDetails: SessionDetail[];
            if (targetLength > currentLength) {
                newDetails = [
                    ...currentDetails,
                    ...Array(targetLength - currentLength).fill(0).map(() => ({ description: '' }))
                ];
            } else {
                newDetails = currentDetails.slice(0, targetLength);
            }
            return { ...prev, sessions: targetLength, sessionDetails: newDetails };
        });
    };
    
    const handleSessionDetailChange = (index: number, field: 'description' | 'color', value: string) => {
        setEditedUnit(prev => {
            const newDetails = [...(prev.sessionDetails || [])];
            const updatedDetail = { ...newDetails[index], [field]: value || (field === 'color' ? undefined : '') };
            newDetails[index] = updatedDetail;
            return { ...prev, sessionDetails: newDetails };
        });
    };

    const handleSessionReorder = (index: number, direction: 'up' | 'down') => {
        setEditedUnit(prev => {
            const details = [...(prev.sessionDetails || [])];
            const newIndex = direction === 'up' ? index - 1 : index + 1;
            if (newIndex < 0 || newIndex >= details.length) return prev;
            
            const [movedItem] = details.splice(index, 1);
            details.splice(newIndex, 0, movedItem);

            return { ...prev, sessionDetails: details };
        });
    };

    const handleMultiSelectChange = (field: 'linkedCriteriaIds' | 'linkedBasicKnowledgeIds', newIdSet: Set<string>) => {
        handleFieldChange(field, Array.from(newIdSet));
    };

    const handleSaveClick = () => {
        if (editedUnit.name.trim()) {
            onSave(editedUnit);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="flex-grow">
                    <label className="text-xs font-medium text-slate-600">Nombre de la Unidad</label>
                    <input type="text" value={editedUnit.name} onChange={e => handleFieldChange('name', e.target.value)} placeholder="Título de la Unidad" className="w-full text-lg font-bold p-1 border-b-2 border-slate-200 focus:border-blue-500 outline-none bg-transparent"/>
                </div>
                 <div>
                    <label className="text-xs font-medium text-slate-600">Nº de Sesiones</label>
                    <input type="number" min="1" value={editedUnit.sessions} onChange={e => handleSessionsChange(parseInt(e.target.value, 10))} className="w-20 p-2 border border-slate-300 rounded-lg text-center"/>
                </div>
                <div>
                    <label className="text-xs font-medium text-slate-600">Fecha de Inicio</label>
                    <input 
                        type="date" 
                        value={editedUnit.startDate || ''} 
                        onChange={e => handleFieldChange('startDate', e.target.value)} 
                        className="p-2 border border-slate-300 rounded-lg"
                        title="Fijar fecha de inicio. Si se deja en blanco, se calculará automáticamente."
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MultiSelect title="Criterios de Evaluación" allItems={criteria} selectedIds={new Set(editedUnit.linkedCriteriaIds || [])} setSelectedIds={(idSet) => handleMultiSelectChange('linkedCriteriaIds', idSet)} />
                <MultiSelect title="Saberes Básicos" allItems={basicKnowledge} selectedIds={new Set(editedUnit.linkedBasicKnowledgeIds || [])} setSelectedIds={(idSet) => handleMultiSelectChange('linkedBasicKnowledgeIds', idSet)} />
            </div>

            <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Detalle de las Sesiones</h4>
                 <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {(editedUnit.sessionDetails || []).map((detail, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 border rounded-lg bg-white">
                            <div className="flex flex-col">
                                <button type="button" onClick={() => handleSessionReorder(index, 'up')} disabled={index === 0} className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"><ArrowUpIcon className="w-4 h-4"/></button>
                                <button type="button" onClick={() => handleSessionReorder(index, 'down')} disabled={index === (editedUnit.sessionDetails || []).length - 1} className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"><ArrowDownIcon className="w-4 h-4"/></button>
                            </div>
                            <label className="text-sm font-semibold text-slate-500 w-20 flex-shrink-0">Sesión {index + 1}:</label>
                            <div className="relative flex-shrink-0 flex items-center gap-1.5">
                                {PALETTE_COLORS.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => handleSessionDetailChange(index, 'color', color)}
                                        className={`w-6 h-6 rounded-full border-2 transition-transform transform hover:scale-110 ${detail.color === color ? 'border-blue-500 ring-2 ring-blue-300' : 'border-white'}`}
                                        style={{ backgroundColor: color }}
                                        title={`Seleccionar color ${color}`}
                                    />
                                ))}
                                {detail.color && (
                                    <button 
                                        type="button"
                                        onClick={() => handleSessionDetailChange(index, 'color', '')}
                                        className="absolute -top-1.5 -right-10 bg-slate-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center hover:bg-slate-700"
                                        title="Quitar color"
                                    >
                                        &times;
                                    </button>
                                )}
                            </div>
                            <input type="text" value={detail.description} onChange={e => handleSessionDetailChange(index, 'description', e.target.value)} placeholder="Contenido o actividad principal..." className="w-full p-2 border border-slate-300 rounded-lg text-sm"/>
                        </div>
                    ))}
                 </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-2 border-t">
                <button onClick={onCancel} className="text-sm font-semibold text-slate-600 hover:text-slate-800 px-3 py-1">Cancelar</button>
                <button onClick={handleSaveClick} className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-md">Guardar Unidad</button>
            </div>
        </div>
    );
};

const MultiSelect = ({ title, allItems, selectedIds, setSelectedIds } : {title:string, allItems: (EvaluationCriterion | BasicKnowledge)[], selectedIds: Set<string>, setSelectedIds: (ids: Set<string>) => void}) => {
    
    const handleSelect = (id: string, checked: boolean) => {
        const newIds = new Set(selectedIds);
        if (checked) newIds.add(id);
        else newIds.delete(id);
        setSelectedIds(newIds);
    }
    
    return (
        <div className="p-3 border rounded-lg bg-white">
            <h4 className="font-semibold text-slate-700 mb-2">{title}</h4>
            <div className="max-h-40 overflow-y-auto space-y-1 pr-2">
                {allItems.map(item => (
                    <label key={item.id} className="flex items-start gap-2 p-1.5 rounded-md hover:bg-slate-50 cursor-pointer">
                        <input type="checkbox" checked={selectedIds.has(item.id)} onChange={e => handleSelect(item.id, e.target.checked)} className="mt-0.5"/>
                        <span className="text-sm text-slate-600"><span className="font-bold">{item.code}:</span> {item.description}</span>
                    </label>
                ))}
            </div>
        </div>
    )
}

export default ProgrammingManager;
