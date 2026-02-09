import React, { useState, useMemo } from 'react';
import type { Course, KeyCompetence, OperationalDescriptor, SpecificCompetence, EvaluationCriterion, BasicKnowledge } from '../types';
import { PencilIcon, TrashIcon, PlusIcon } from './Icons';


const Accordion: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <details className="border border-slate-200 rounded-lg">
        <summary className="p-3 cursor-pointer font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-t-lg">{title}</summary>
        <div className="p-4 bg-white rounded-b-lg">
            {children}
        </div>
    </details>
);

// Helper function for robust stage detection
const isBachilleratoStage = (level: string): boolean => /bach/i.test(level);

const CurriculumManager = (props: any) => {
    const { courses, keyCompetences, setKeyCompetences, specificCompetences, setSpecificCompetences, evaluationCriteria, setEvaluationCriteria, basicKnowledge, setBasicKnowledge } = props;
    const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');

    const handleUpdate = (type: 'ec' | 'sc' | 'kc' | 'sb', item: any) => {
        switch (type) {
            case 'ec':
                setEvaluationCriteria((prev: any) => prev.map((i: any) => i.id === item.id ? item : i));
                break;
            case 'sc':
                setSpecificCompetences((prev: any) => prev.map((i: any) => i.id === item.id ? item : i));
                break;
            case 'kc':
                 setKeyCompetences((prev: any) => prev.map((i: any) => i.id === item.id ? item : i));
                break;
            case 'sb':
                setBasicKnowledge((prev: any) => prev.map((i: any) => i.id === item.id ? item : i));
                break;
        }
    };
    
    const handleDelete = (type: 'ec' | 'sc' | 'kc' | 'sb', id: string) => {
        if (!window.confirm("¿Seguro que quieres eliminar este elemento? Esta acción no se puede deshacer.")) {
            return;
        }

        switch (type) {
            case 'ec':
                setEvaluationCriteria((prev: EvaluationCriterion[]) => prev.filter(c => c.id !== id));
                break;
            case 'sc': { 
                const isDependency = evaluationCriteria.some((ec: EvaluationCriterion) => ec.competenceId === id);
                if (isDependency) {
                    alert("No se puede eliminar esta competencia específica porque hay criterios de evaluación que dependen de ella.");
                    return;
                }
                setSpecificCompetences((prev: SpecificCompetence[]) => prev.filter(c => c.id !== id));
                break;
            }
            case 'kc':
                alert("La eliminación de Competencias Clave y Descriptores no está permitida para mantener la integridad del currículo base.");
                break;
            case 'sb':
                setBasicKnowledge((prev: BasicKnowledge[]) => prev.filter(sb => sb.id !== id));
                break;
        }
    };


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!selectedCourseId) {
            alert("Por favor, selecciona un curso para el que importar el currículo.");
            if (event.target) event.target.value = '';
            return;
        }

        const file = event.target.files?.[0];
        if (!file) return;

        const course = courses.find((c: Course) => c.id === selectedCourseId);
        if (!course) return;

        const stage = isBachilleratoStage(course.level) ? 'Bachillerato' : 'ESO';
        const courseName = `${course.level} - ${course.subject}`;
        
        const confirmationMessage = `Se va a importar el currículo para el curso '${courseName}'.\n\n` +
            `- Competencias Específicas, Criterios y Saberes de ESTE CURSO serán reemplazados.\n` +
            `- Descriptores Operativos para la etapa '${stage}' serán FUSIONADOS inteligentemente por código (ej. CCL1) para evitar duplicados.\n` +
            `- Los datos de otros cursos no se verán afectados.\n\n` +
            `¿Deseas continuar?`;

        if (!window.confirm(confirmationMessage)) {
             if (event.target) event.target.value = '';
             return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const buffer = e.target?.result as ArrayBuffer;
            if (!buffer) {
                alert('No se pudo leer el archivo.');
                return;
            }

            const view = new Uint8Array(buffer);
            let encoding = 'utf-8'; // Default encoding

            // Check for Byte Order Mark (BOM) to detect encoding
            if (view.length >= 2) {
                if (view[0] === 0xFF && view[1] === 0xFE) {
                    encoding = 'utf-16le';
                } else if (view[0] === 0xFE && view[1] === 0xFF) {
                    encoding = 'utf-16be';
                } else if (view.length >= 3 && view[0] === 0xEF && view[1] === 0xBB && view[2] === 0xBF) {
                    encoding = 'utf-8';
                }
            }

            try {
                const decoder = new TextDecoder(encoding);
                const text = decoder.decode(buffer);

                const parsedData = parseCurriculumCsv(text, selectedCourseId, specificCompetences);
                updateCurriculumState(parsedData, selectedCourseId);
            } catch (error) {
                console.error('Error parsing CSV:', error);
                alert('Error al procesar el archivo CSV. Comprueba el formato, el contenido y la codificación del archivo (UTF-8 o UTF-16).');
            }
        };
        reader.onerror = () => {
            alert('Error al leer el archivo.');
        };
        
        reader.readAsArrayBuffer(file);

        if (event.target) event.target.value = '';
    };
    
    const parseCurriculumCsv = (csvText: string, courseId: string, existingSpecificCompetences: SpecificCompetence[]) => {
        const lines = csvText.split(/\r\n|\n/).filter(line => line.trim() !== '');
        if (lines.length < 1) return { newKCs: [], newODs: [], newSCs: [], newECs: [], newSBs: [] };
        
        lines.shift(); // Remove header line

        const newKCs: (Omit<KeyCompetence, 'descriptors'>)[] = [];
        const newODs: (OperationalDescriptor & { parentKcId: string })[] = [];
        const newSCs: SpecificCompetence[] = [];
        const newECs: EvaluationCriterion[] = [];
        const newSBs: BasicKnowledge[] = [];

        const parseCsvLine = (line: string): string[] => {
            const result: string[] = [];
            let currentVal = "";
            let inQuotes = false;
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
                        currentVal += '"';
                        i++; 
                    } else {
                        inQuotes = !inQuotes;
                    }
                } else if (char === ',' && !inQuotes) {
                    result.push(currentVal.trim());
                    currentVal = "";
                } else {
                    currentVal += char;
                }
            }
            result.push(currentVal.trim());
            return result;
        };
        
        // Mapa de CÓDIGOS de Competencias Específicas a sus IDs, priorizando las de ESTE ARCHIVO
        const localScCodeToIdMap = new Map<string, string>();
        
        // Pre-escaneo para construir el mapa local de Competencias Específicas del archivo
        lines.forEach(line => {
            const parts = parseCsvLine(line);
            const [type, id, code] = parts;
            if (type?.toUpperCase() === 'SC' && id && code) {
                localScCodeToIdMap.set(code, id);
            }
        });

        // Procesamiento principal del archivo
        for (const line of lines) {
            const parts = parseCsvLine(line);
            const [type, id, code, description, ...links] = parts;
            if (!type || !id || !code || !description) continue;
            const commonData = { id, code, description };
            
            switch (type.toUpperCase()) {
                case 'KC':
                    newKCs.push({ ...commonData });
                    break;
                case 'OD':
                    newODs.push({ ...commonData, parentKcId: links[0] });
                    break;
                case 'SC':
                    const scData = { ...commonData, courseId, keyCompetenceDescriptorIds: links.filter(l => l) };
                    newSCs.push(scData);
                    break;
                case 'EC':
                    const criterionCode = commonData.code;
                    const competenceNumberMatch = criterionCode.match(/^(\d+)\./);
                    let competenceId = links[0] || ''; 
                    
                    if (competenceNumberMatch && competenceNumberMatch[1]) {
                        const targetScCode = `CEs ${competenceNumberMatch[1].trim()}`;
                        if (localScCodeToIdMap.has(targetScCode)) {
                            // Prioridad 1: Usar la competencia del archivo actual
                            competenceId = localScCodeToIdMap.get(targetScCode)!;
                        } else {
                             // Prioridad 2: Buscar una competencia existente con ese código (comportamiento anterior, como fallback)
                            const existingSc = existingSpecificCompetences.find(sc => sc.code === targetScCode && sc.courseId === courseId);
                            if (existingSc) {
                                competenceId = existingSc.id;
                                console.warn(`WARN: El criterio '${criterionCode}' se ha vinculado a una Competencia Específica existente ('${targetScCode}') porque no se encontró una con ese código en el archivo CSV importado.`);
                            } else {
                                console.error(`ERROR: No se pudo encontrar una Competencia Específica con el código '${targetScCode}' para vincular el criterio '${criterionCode}'. Por favor, asegúrate de que la competencia está definida en el mismo archivo CSV.`);
                            }
                        }
                    }
                    newECs.push({ ...commonData, courseId: courseId, competenceId: competenceId });
                    break;
                case 'SB':
                    newSBs.push({ ...commonData, courseId });
                    break;
            }
        }
        return { newKCs, newODs, newSCs, newECs, newSBs };
    };

    const updateCurriculumState = ({ newKCs, newODs, newSCs, newECs, newSBs }: {
        newKCs: (Omit<KeyCompetence, 'descriptors'>)[];
        newODs: (OperationalDescriptor & { parentKcId: string })[];
        newSCs: SpecificCompetence[];
        newECs: EvaluationCriterion[];
        newSBs: BasicKnowledge[];
    }, courseId: string) => {
        if ([newKCs, newODs, newSCs, newECs, newSBs].every(arr => arr.length === 0)) {
            alert("No se encontraron elementos curriculares válidos en el archivo.");
            return;
        }

        const course = courses.find((c: Course) => c.id === courseId);
        if (!course) return;

        const isBachStage = isBachilleratoStage(course.level);
        const stage = isBachStage ? 'Bachillerato' : 'ESO';
        const suffix = isBachStage ? '-bach' : '-eso';

        const augmentId = (id: string, suffixToAdd: string) => {
            if (id.endsWith('-eso') || id.endsWith('-bach')) {
                return id;
            }
            return id + suffixToAdd;
        };

        // Map to track ID substitutions for Descriptors. 
        // Key: Import ID (with suffix), Value: Resolved/Existing System ID
        const odIdReplacementMap = new Map<string, string>();

        // Augment IDs in the new data to make them stage-specific
        const augmentedODs = newODs.map(od => ({ ...od, id: augmentId(od.id, suffix) }));
        
        // We will process SC links later, after resolving descriptor IDs

        setEvaluationCriteria((prevCriteria: EvaluationCriterion[]) => {
            const criteriaFromOtherCourses = prevCriteria.filter(c => c.courseId !== courseId);
            return [...criteriaFromOtherCourses, ...newECs];
        });

        setBasicKnowledge((prevSBs: BasicKnowledge[]) => {
            const sbsFromOtherCourses = prevSBs.filter(sb => sb.courseId !== courseId);
            return [...sbsFromOtherCourses, ...newSBs];
        });
        
        // KEY COMPETENCES AND DESCRIPTORS MERGING LOGIC
        setKeyCompetences((prevKCs: KeyCompetence[]) => {
            const nextKCs = JSON.parse(JSON.stringify(prevKCs)) as KeyCompetence[];
            const kcMapByCode = new Map<string, KeyCompetence>(nextKCs.map(kc => [kc.code, kc]));
            const importKcIdToCodeMap = new Map(newKCs.map(kc => [kc.id, kc.code]));

            newKCs.forEach(nkc => {
                if (kcMapByCode.has(nkc.code)) {
                    kcMapByCode.get(nkc.code)!.description = nkc.description;
                } else {
                    const newFullKc: KeyCompetence = { ...nkc, descriptors: [] };
                    kcMapByCode.set(nkc.code, newFullKc);
                }
            });

            const newODsByParentCode = new Map<string, OperationalDescriptor[]>();
            augmentedODs.forEach(od => {
                const parentCode = importKcIdToCodeMap.get(od.parentKcId);
                if (parentCode) {
                    if (!newODsByParentCode.has(parentCode)) newODsByParentCode.set(parentCode, []);
                    const { parentKcId, ...descriptorData } = od;
                    newODsByParentCode.get(parentCode)!.push(descriptorData);
                }
            });
            
            for (const kc of kcMapByCode.values()) {
                const stageIdentifier = suffix;
                
                const otherStageDescriptors = (kc.descriptors || []).filter(d => !d.id.endsWith(stageIdentifier));
                const currentStageDescriptors = (kc.descriptors || []).filter(d => d.id.endsWith(stageIdentifier));
                
                const newDescriptorsForThisKC = newODsByParentCode.get(kc.code) || [];

                // SMART MERGE: Map by CODE (e.g. "CCL1"), not just ID.
                // This allows merging 'od_bg3_ccl1' and 'od_bg4_ccl1' if they share the code "CCL1".
                const mergedDescriptorsByCode = new Map<string, OperationalDescriptor>();
                
                // 1. Populate with existing descriptors
                currentStageDescriptors.forEach(d => {
                     mergedDescriptorsByCode.set(d.code, d);
                });

                // 2. Process new descriptors
                newDescriptorsForThisKC.forEach(newDesc => {
                    if (mergedDescriptorsByCode.has(newDesc.code)) {
                        // Conflict detected by Code: Reuse the EXISTING ID.
                        const existing = mergedDescriptorsByCode.get(newDesc.code)!;
                        
                        // Record that any reference to newDesc.id should point to existing.id
                        odIdReplacementMap.set(newDesc.id, existing.id);
                        
                        // Update description from import, but keep existing ID
                        mergedDescriptorsByCode.set(newDesc.code, { 
                            ...newDesc, 
                            id: existing.id 
                        });
                    } else {
                        // No conflict, add as new
                        mergedDescriptorsByCode.set(newDesc.code, newDesc);
                    }
                });

                kc.descriptors = [...otherStageDescriptors, ...Array.from(mergedDescriptorsByCode.values())];
            }

            return Array.from(kcMapByCode.values());
        });

        // SPECIFIC COMPETENCES MERGING (WITH LINK RESOLUTION)
        setSpecificCompetences((prev: SpecificCompetence[]) => {
            const scsFromOtherCourses = prev.filter(sc => sc.courseId !== courseId);
            
            const resolvedSCs = newSCs.map(sc => {
                // 1. Augment IDs first (add suffix)
                const rawDescriptorIds = sc.keyCompetenceDescriptorIds.map(id => augmentId(id, suffix));
                
                // 2. Resolve IDs using the replacement map generated during Descriptor merging
                const resolvedDescriptorIds = rawDescriptorIds.map(id => {
                    if (odIdReplacementMap.has(id)) {
                        return odIdReplacementMap.get(id)!;
                    }
                    return id;
                });

                // Remove duplicates in links just in case
                return {
                    ...sc,
                    keyCompetenceDescriptorIds: Array.from(new Set(resolvedDescriptorIds))
                };
            });

            return [...scsFromOtherCourses, ...resolvedSCs];
        });
        
        const courseName = `${course.level} - ${course.subject}`;
        alert(`Currículo para '${courseName}' (${stage.toUpperCase()}) importado con éxito.\n\nSe ha aplicado una fusión inteligente de Descriptores Operativos para evitar duplicados entre cursos.`);
    };

    const handleDeleteCurriculum = () => {
        if (!selectedCourseId) {
            alert("Por favor, selecciona un curso para definir el nivel educativo a eliminar (ESO o Bachillerato).");
            return;
        }

        const course = courses.find((c: Course) => c.id === selectedCourseId);
        if (!course) return;

        const isBachStage = isBachilleratoStage(course.level);
        const stage = isBachStage ? 'Bachillerato' : 'ESO';
        const stageIdentifier = isBachStage ? '-bach' : '-eso';
        
        const courseIdsForStage = courses
            .filter((c: Course) => isBachilleratoStage(c.level) === isBachStage)
            .map((c: Course) => c.id);
        
        const coursesToDeleteText = courses
            .filter((c: Course) => courseIdsForStage.includes(c.id))
            .map((c: Course) => `- ${c.level} ${c.subject}`)
            .join('\n');

        const confirmationMessage = `¡ADVERTENCIA! Esta acción es irreversible.\n\n` +
            `Se eliminará el currículo completo de la etapa ${stage}. Esto incluye:\n\n` +
            `1. TODAS las Competencias Específicas, Criterios de Evaluación y Saberes Básicos de los siguientes cursos:\n${coursesToDeleteText}\n` +
            `2. TODOS los Descriptores Operativos de ${stage} en todas las Competencias Clave.\n\n` +
            `Si una Competencia Clave se queda sin descriptores, también será eliminada.\n` +
            `¿Estás absolutamente seguro de que quieres continuar?`;

        if (window.confirm(confirmationMessage)) {
            const courseIdsSet = new Set(courseIdsForStage);

            setEvaluationCriteria((prev: EvaluationCriterion[]) => prev.filter(item => !courseIdsSet.has(item.courseId)));
            setSpecificCompetences((prev: SpecificCompetence[]) => prev.filter(item => !courseIdsSet.has(item.courseId)));
            setBasicKnowledge((prev: BasicKnowledge[]) => prev.filter(item => !courseIdsSet.has(item.courseId)));

            setKeyCompetences((prevKCs: KeyCompetence[]) => {
                const kcsWithFilteredDescriptors = prevKCs.map(kc => {
                    const remainingDescriptors = (kc.descriptors || []).filter(d => !d.id.endsWith(stageIdentifier));
                    return { ...kc, descriptors: remainingDescriptors };
                });
                
                return kcsWithFilteredDescriptors.filter(kc => kc.descriptors.length > 0);
            });
            
            alert(`El currículo para la etapa ${stage} ha sido eliminado.`);
        }
    };

    const courseName = courses.find((c: Course) => c.id === selectedCourseId)?.subject || '...';
    const filteredCriteria = useMemo(() => evaluationCriteria.filter((ec: EvaluationCriterion) => ec.courseId === selectedCourseId), [evaluationCriteria, selectedCourseId]);
    const filteredCompetences = useMemo(() => specificCompetences.filter((sc: SpecificCompetence) => sc.courseId === selectedCourseId), [specificCompetences, selectedCourseId]);
    const filteredBasicKnowledge = useMemo(() => basicKnowledge.filter((sb: BasicKnowledge) => sb.courseId === selectedCourseId), [basicKnowledge, selectedCourseId]);
    
    const selectedCourse = useMemo(() => courses.find((c: Course) => c.id === selectedCourseId), [courses, selectedCourseId]);
    const selectedStageSuffix = useMemo(() => {
        if (!selectedCourse) return null;
        return isBachilleratoStage(selectedCourse.level) ? '-bach' : '-eso';
    }, [selectedCourse]);

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Gestor del Currículo</h3>
                <p className="text-sm text-slate-600 mb-4">
                    Visualiza y edita los elementos curriculares. Las competencias específicas, criterios y saberes se muestran según el curso seleccionado.
                </p>
                <div className="mb-4">
                  <label htmlFor="course-curr-select" className="block text-sm font-medium text-slate-700 mb-1">Curso a gestionar:</label>
                  <select id="course-curr-select" value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg">
                      <option value="" disabled>Selecciona un curso...</option>
                      {courses.map((course: Course) => (
                          <option key={course.id} value={course.id}>{course.level} - {course.subject}</option>
                      ))}
                  </select>
                </div>
            </div>

            <div className="space-y-3">
                <Accordion title="Competencias Clave y Descriptores Operativos">
                    <div className="space-y-4">
                        {keyCompetences.map((kc: KeyCompetence) => {
                             const descriptorsToShow = (kc.descriptors || []).filter(d => 
                                !selectedStageSuffix || // show all if no course selected
                                d.id.endsWith(selectedStageSuffix) || // show if matches stage
                                (!d.id.endsWith('-eso') && !d.id.endsWith('-bach')) // always show generic
                            );
                            
                            if (descriptorsToShow.length === 0) return null;

                            return (
                                <div key={kc.id} className="p-3 border border-slate-200 rounded-lg bg-slate-50/50">
                                    <p className="font-semibold">{kc.code}: <span className="font-normal">{kc.description}</span></p>
                                    <div className="pl-4 mt-2 space-y-1">
                                        {descriptorsToShow.map(od => (
                                            <p key={od.id} className="text-xs text-slate-600"><span className="font-bold">{od.code}:</span> {od.description}</p>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Accordion>

                <Accordion title={`Competencias Específicas para ${courseName}`}>
                    <div className="space-y-2">
                        {filteredCompetences.map((sc: SpecificCompetence) => (
                            <EditableItem key={sc.id} item={sc} type="sc" onSave={handleUpdate} onDelete={handleDelete} />
                        ))}
                    </div>
                </Accordion>

                 <Accordion title={`Criterios de Evaluación para ${courseName}`}>
                    <div className="space-y-2">
                        {filteredCriteria.map((ec: EvaluationCriterion) => (
                            <EditableItem key={ec.id} item={ec} type="ec" onSave={handleUpdate} onDelete={handleDelete} />
                        ))}
                    </div>
                 </Accordion>
                 <Accordion title={`Saberes Básicos para ${courseName}`}>
                    <div className="space-y-2">
                        {filteredBasicKnowledge.map((sb: BasicKnowledge) => (
                            <EditableItem key={sb.id} item={sb} type="sb" onSave={handleUpdate} onDelete={handleDelete} />
                        ))}
                    </div>
                 </Accordion>
            </div>
            
            <div className="pt-6 border-t">
                 <h4 className="text-lg font-bold text-slate-800 mb-2">Importar Currículo desde CSV</h4>
                 <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 space-y-3">
                    <p className="font-semibold">Instrucciones para el formato del archivo CSV:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>El currículo importado (CE, EC, SB) se asignará automáticamente al curso seleccionado en el desplegable. <strong>No es necesario añadir una columna `courseId` al CSV.</strong></li>
                        <li>El archivo debe tener una cabecera: <strong>type,id,code,description,links...</strong></li>
                        <li>Utiliza la codificación <strong>UTF-8</strong> para evitar problemas con tildes y caracteres especiales.</li>
                        <li>Si la descripción contiene comas, debe ir entre comillas dobles (<code>"</code>).</li>
                        <li>Los Descriptores Operativos (OD) se vincularán a la etapa (ESO/Bachillerato) del curso seleccionado.</li>
                        <li><strong>Importante:</strong> El sistema detectará si los Descriptores (OD) ya existen por su código (ej. "CCL1") y los unificará automáticamente, incluso si los IDs en el archivo CSV son diferentes entre cursos (ej. <code>od_bg3_ccl1</code> vs <code>od_bg4_ccl1</code>).</li>
                        <li>La columna <strong>id</strong> debe ser un identificador <strong>único para CEs, ECs y SBs</strong>.</li>
                        <li>La columna <strong>type</strong> indica el tipo de elemento:
                            <ul className="list-['-_'] list-inside pl-4">
                                <li><strong>KC:</strong> Competencia Clave.</li>
                                <li><strong>OD:</strong> Descriptor Operativo. En la 5ª columna, poner el <code>id</code> de su Competencia Clave (el `id` de la fila KC en el mismo archivo).</li>
                                <li><strong>SC:</strong> Competencia Específica. En las siguientes columnas, los <code>id</code> de sus Descriptores Operativos. Se asignará al curso seleccionado.</li>
                                <li><strong>EC:</strong> Criterio de Evaluación. El sistema lo vinculará a la Competencia Específica (SC) que tenga el código correspondiente (ej. un criterio "1.2" se vincula a la CE "CEs 1") <strong>definida en el mismo archivo</strong>. Se asignará al curso seleccionado.</li>
                                <li><strong>SB:</strong> Saber Básico. No necesita enlaces. Se asignará al curso seleccionado.</li>
                            </ul>
                        </li>
                    </ul>
                    <details>
                        <summary className="cursor-pointer font-medium text-blue-600 hover:underline">Ver ejemplo de formato</summary>
                        <pre className="mt-2 p-2 bg-slate-200 text-xs rounded overflow-x-auto">
{`type,id,code,description,links
KC,kc-ccl-generic,"CCL","Competencia en comunicación lingüística"
OD,od-ccl1-generic,"CCL1","Se expresa de forma oral...",kc-ccl-generic
SC,sc-bg3-1,"CEs 1","Interpretar y transmitir información...",od-ccl1-generic
EC,ec-bg3-1.1,"1.1","Analizar conceptos y procesos biológicos..."
SB,sb-bg3-1,"A.1","La célula como unidad estructural..."`}
                        </pre>
                    </details>
                </div>

                <div className="flex items-end gap-4 p-3 bg-slate-100 rounded-lg border mt-4">
                    <input
                        type="file"
                        id="csv-importer"
                        className="hidden"
                        accept=".csv, text/csv"
                        onChange={handleFileChange}
                    />
                    <label
                        htmlFor="csv-importer"
                        className={`cursor-pointer w-full text-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors ${!selectedCourseId ? 'bg-blue-300 cursor-not-allowed' : ''}`}
                    >
                        Seleccionar y Cargar Archivo CSV...
                    </label>
                </div>
            </div>

            <div className="pt-6 border-t border-red-200 mt-6">
                <h4 className="text-lg font-bold text-red-800 mb-2">Zona de Peligro</h4>
                <p className="text-sm text-slate-600 mb-4">
                    Esta acción elimina el currículo para toda una etapa educativa (ESO o Bachillerato), según el curso seleccionado.
                </p>
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <button
                        onClick={handleDeleteCurriculum}
                        disabled={!selectedCourseId}
                        className="w-full text-center bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300 disabled:cursor-not-allowed"
                    >
                        Eliminar Currículo de la Etapa Seleccionada
                    </button>
                </div>
            </div>
        </div>
    );
};

const EditableItem = ({ item, type, onSave, onDelete }: any) => {
    const [isEditing, setIsEditing] = useState(false);
    const [data, setData] = useState(item);

    const handleSave = () => {
        onSave(type, data);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setData(item);
        setIsEditing(false);
    };
    
    if (isEditing) {
        return (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                <input 
                    value={data.code} 
                    onChange={(e) => setData({ ...data, code: e.target.value })}
                    className="w-full p-1 border rounded"
                    placeholder="Código"
                />
                 <textarea 
                    value={data.description} 
                    onChange={(e) => setData({ ...data, description: e.target.value })}
                    className="w-full p-1 border rounded text-sm min-h-[60px]"
                    placeholder="Descripción"
                />
                <div className="flex justify-end gap-2">
                    <button onClick={handleCancel} className="text-xs font-semibold text-slate-600 hover:text-slate-800">Cancelar</button>
                    <button onClick={handleSave} className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md">Guardar</button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2 p-2 group hover:bg-slate-50 rounded-md">
            <div className="flex-grow">
                <p className="font-semibold text-sm">{item.code}: <span className="font-normal text-slate-700">{item.description}</span></p>
                {type === 'sc' && <p className="text-xs text-slate-500 mt-1">Descriptores: {(item.keyCompetenceDescriptorIds || []).join(', ')}</p>}
                 {type === 'ec' && <p className="text-xs text-slate-500 mt-1">Comp. Específica: {item.competenceId}</p>}
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button onClick={() => setIsEditing(true)} className="p-1.5 hover:bg-slate-200 rounded-full"><PencilIcon className="w-4 h-4 text-slate-600" /></button>
                <button onClick={() => onDelete(type, item.id)} className="p-1.5 hover:bg-red-100 rounded-full"><TrashIcon className="w-4 h-4 text-red-500" /></button>
            </div>
        </div>
    );
};


export default CurriculumManager;