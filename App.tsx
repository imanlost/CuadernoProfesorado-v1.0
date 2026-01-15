
// FIX: Corrected the React import statement.
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { INITIAL_CLASS_DATA, INITIAL_COMPETENCES, INITIAL_CRITERIA, INITIAL_KEY_COMPETENCES, INITIAL_JOURNAL_ENTRIES, INITIAL_COURSES, INITIAL_PROGRAMMING_UNITS, INITIAL_BASIC_KNOWLEDGE, INITIAL_ACADEMIC_CONFIGURATION, INITIAL_EVALUATION_TOOLS } from './constants';
import type { ClassData, EvaluationCriterion, SpecificCompetence, KeyCompetence, JournalEntry, Course, ProgrammingUnit, BasicKnowledge, AcademicConfiguration, EvaluationTool, Assignment } from './types';
import GradebookTable from './components/GradebookTable';
import CriteriaAchievement from './components/CriteriaAchievement';
import SpecificCompetenceAchievement from './components/SpecificCompetenceAchievement';
import KeyCompetenceAchievement from './components/KeyCompetenceAchievement';
import DescriptorAchievement from './components/DescriptorAchievement';
import ClassJournal from './components/ClassJournal';
import { BookOpenIcon, CalendarDaysIcon, Cog8ToothIcon, ChevronDownIcon } from './components/Icons';
import SettingsModal from './components/SettingsModal';
import ExportModal from './components/ExportModal';
import CalendarView from './components/CalendarView';
import Logo from './components/Logo';

// Type for the entire application state
interface AppState {
  classes: ClassData[];
  keyCompetences: KeyCompetence[];
  competences: SpecificCompetence[];
  criteria: EvaluationCriterion[];
  journalEntries: JournalEntry[];
  courses: Course[];
  programmingUnits: ProgrammingUnit[];
  basicKnowledge: BasicKnowledge[];
  academicConfiguration: AcademicConfiguration;
  evaluationTools: EvaluationTool[];
}

// TypeScript declaration for the sql.js library loaded from CDN
declare const initSqlJs: (config?: any) => Promise<any>;

// Helper functions for IndexedDB
const DB_NAME = 'gradebook-sqlite-db';
const DB_STORE_NAME = 'database';

const indexedDB = {
  get: (): Promise<Uint8Array | undefined> => {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(DB_STORE_NAME, 'readonly');
        const store = tx.objectStore(DB_STORE_NAME);
        const getRequest = store.get('db_file');
        getRequest.onsuccess = () => resolve(getRequest.result);
        getRequest.onerror = () => reject(getRequest.error);
      };
      request.onupgradeneeded = () => {
        request.result.createObjectStore(DB_STORE_NAME);
      };
    });
  },
  set: (data: Uint8Array): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(DB_STORE_NAME, 'readwrite');
        const store = tx.objectStore(DB_STORE_NAME);
        const setRequest = store.put(data, 'db_file');
        setRequest.onsuccess = () => resolve();
        setRequest.onerror = () => reject(setRequest.error);
      };
    });
  },
};

// Custom hook for SQLite database management
function useDatabase() {
    const dbRef = useRef<any>(null);
    const [appState, setAppState] = useState<AppState | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadDataFromDb = (db: any) => {
        try {
            const res = db.exec("SELECT data FROM app_data WHERE key = 'main'");
            if (res.length > 0 && res[0].values.length > 0) {
                const loadedState = JSON.parse(res[0].values[0][0]);
                // Ensure new fields exist on older databases
                if (!loadedState.evaluationTools) {
                    loadedState.evaluationTools = [];
                }
                return loadedState;
            }
        } catch (e) {
            console.error("Could not read from DB, maybe it's new?", e);
        }
        return null;
    };
    
    useEffect(() => {
        const initialize = async () => {
            try {
                const SQL = await initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}` });
                const savedDb = await indexedDB.get();
                let db;
                if (savedDb) {
                    db = new SQL.Database(savedDb);
                } else {
                    db = new SQL.Database();
                    db.exec("CREATE TABLE app_data (key TEXT PRIMARY KEY, data TEXT)");
                    const initialState: AppState = {
                        classes: INITIAL_CLASS_DATA,
                        keyCompetences: INITIAL_KEY_COMPETENCES,
                        competences: INITIAL_COMPETENCES,
                        criteria: INITIAL_CRITERIA,
                        journalEntries: INITIAL_JOURNAL_ENTRIES,
                        courses: INITIAL_COURSES,
                        programmingUnits: INITIAL_PROGRAMMING_UNITS,
                        basicKnowledge: INITIAL_BASIC_KNOWLEDGE,
                        academicConfiguration: INITIAL_ACADEMIC_CONFIGURATION,
                        evaluationTools: INITIAL_EVALUATION_TOOLS,
                    };
                    // Initial save
                    db.exec("INSERT OR REPLACE INTO app_data (key, data) VALUES ('main', ?)", [JSON.stringify(initialState)]);
                    const binaryDb = db.export();
                    await indexedDB.set(binaryDb);
                }
                dbRef.current = db;
                const data = loadDataFromDb(db);
                setAppState(data);
            } catch (err) {
                console.error("Database initialization failed:", err);
                setError("No se pudo cargar la base de datos.");
            } finally {
                setLoading(false);
            }
        };
        initialize();
    }, []);
    
    // FIX: Implemented debounced autosaving to prevent performance issues and data loss.
    // The app state is now persisted to IndexedDB 1.5 seconds after the last change.
    useEffect(() => {
        // Do not save while loading or if state is not yet initialized.
        if (loading || !appState) {
            return;
        }

        const handler = setTimeout(() => {
            const persistState = async () => {
                if (!dbRef.current) return;
                try {
                    const db = dbRef.current;
                    db.exec("INSERT OR REPLACE INTO app_data (key, data) VALUES ('main', ?)", [JSON.stringify(appState)]);
                    const binaryDb = db.export();
                    await indexedDB.set(binaryDb);
                } catch (e) {
                    console.error("Failed to autosave database:", e);
                    setError("Error al guardar los datos automáticamente.");
                }
            };
            persistState();
        }, 1500); // 1.5-second debounce timer

        return () => {
            clearTimeout(handler);
        };
    }, [appState, loading]); // This effect triggers on every state change.

    // Renamed from updateStateAndPersist. This now only updates React's state.
    const updateState = useCallback((updater: (prevState: AppState) => AppState) => {
        setAppState(prevState => {
            if (!prevState) return null;
            return updater(prevState);
        });
    }, []);

    const importDatabase = useCallback(async (buffer: ArrayBuffer) => {
        setLoading(true);
        try {
            const SQL = await initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}` });
            const db = new SQL.Database(new Uint8Array(buffer));
            dbRef.current = db;
            const data = loadDataFromDb(db);
            if (data) {
                setAppState(data);
                const binaryDb = db.export(); // Get binary data from the new DB
                await indexedDB.set(binaryDb); // Save imported DB to IndexedDB
                alert("Base de datos importada con éxito.");
            } else {
                throw new Error("El archivo de base de datos no es válido o está vacío.");
            }
        } catch (e) {
            console.error(e);
            alert(`Error al importar la base de datos: ${e instanceof Error ? e.message : String(e)}`);
            // Optionally, reload the old state if import fails
        } finally {
            setLoading(false);
        }
    }, []);

    const exportDatabase = useCallback(() => {
        if (dbRef.current) {
            return dbRef.current.export();
        }
        return null;
    }, []);

    const resetDatabase = useCallback(async () => {
        const confirmed = window.confirm(
            "¡ADVERTENCIA MÁXIMA! Esta acción es irreversible y eliminará ABSOLUTAMENTE TODOS los datos de la aplicación: clases, alumnos, calificaciones, currículo, planificaciones, TODO. La aplicación quedará completamente en blanco, lista para que introduzcas tus propios datos desde cero. ¿Estás COMPLETAMENTE seguro de que quieres borrar todo?"
        );

        if (!dbRef.current || !confirmed) {
            return;
        }

        setLoading(true);
        try {
            // FIX: The blankState was missing required properties for AcademicConfiguration and AppState.
            // Added empty arrays for holidays, evaluationPeriods, and evaluationTools to satisfy the types.
            const blankState: AppState = {
                classes: [],
                keyCompetences: [],
                competences: [],
                criteria: [],
                journalEntries: [],
                courses: [],
                programmingUnits: [],
                basicKnowledge: [],
                academicConfiguration: {
                    academicYearStart: `${new Date().getFullYear()}-09-01`,
                    academicYearEnd: `${new Date().getFullYear() + 1}-06-21`,
                    holidays: [],
                    evaluationPeriods: [],
                    evaluationPeriodWeights: {},
                    periods: [
                        '1ª Hora (8:00-8:55)', '2ª Hora (8:55-9:50)', 'Recreo (9:50-10:20)',
                        '3ª Hora (10:20-11:15)', '4ª Hora (11:15-12:10)', 'Recreo (12:10-12:40)',
                        '5ª Hora (12:40-13:35)', '6ª Hora (13:35-14:30)',
                    ],
                    defaultStartView: 'calendar',
                    defaultCalendarView: 'month'
                },
                evaluationTools: [],
            };
            dbRef.current.exec("INSERT OR REPLACE INTO app_data (key, data) VALUES ('main', ?)", [JSON.stringify(blankState)]);
            const binaryDb = dbRef.current.export();
            await indexedDB.set(binaryDb);
            setAppState(blankState);
            alert("Todos los datos han sido borrados. La aplicación se recargará.");
            window.location.reload();
        } catch (e) {
            console.error("Failed to reset database:", e);
            setError("Error al restablecer la base de datos.");
        } finally {
            setLoading(false);
        }
    }, []);

    return { appState, loading, error, updateState, importDatabase, exportDatabase, resetDatabase };
}

type View = 'calendar' | 'gradebook' | 'journal' | 'criteria' | 'competences' | 'key-competences' | 'descriptors';

const App = () => {
    const { appState, loading, error, updateState, importDatabase, exportDatabase, resetDatabase } = useDatabase();
    
    // --- UI State ---
    const [activeClassId, setActiveClassId] = useState<string>('');
    const [activeView, setActiveView] = useState<View>('calendar');
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [notebookOpen, setNotebookOpen] = useState(false);
    const notebookRef = useRef<HTMLDivElement>(null);
    const [initialized, setInitialized] = useState(false);

    // --- Derived State & Callbacks ---
    useEffect(() => {
        if (appState && !initialized) {
            // Set initial view based on settings
            const defaultView = appState.academicConfiguration?.defaultStartView || 'calendar';
            setActiveView(defaultView as View);
            
            if (appState.classes.length > 0) {
                const academicCourses = new Set((appState.courses || []).filter(c => c.type !== 'other').map(c => c.id));
                const firstAcademicClass = appState.classes.find(c => academicCourses.has(c.courseId));
                setActiveClassId(firstAcademicClass?.id || appState.classes[0].id);
            }
            setInitialized(true);
        }
    }, [appState, initialized]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notebookRef.current && !notebookRef.current.contains(event.target as Node)) {
                setNotebookOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [notebookRef]);


    const activeClass = useMemo(() => {
        if (!appState) return null;
        return appState.classes.find(c => c.id === activeClassId);
    }, [appState, activeClassId]);

    const handleUpdateClass = useCallback((updatedClass: ClassData) => {
        updateState(prev => ({
            ...prev,
            classes: prev.classes.map(c => c.id === updatedClass.id ? updatedClass : c),
        }));
    }, [updateState]);

    const handleCopyAssignment = useCallback((sourceAssignment: Assignment, targetClassId: string, targetPeriodId: string, targetCategoryId: string) => {
        updateState(prev => {
            const targetClassIndex = prev.classes.findIndex(c => c.id === targetClassId);
            if (targetClassIndex === -1) return prev;

            const newAssignment: Assignment = {
                ...sourceAssignment,
                id: `a-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                categoryId: targetCategoryId,
                evaluationPeriodId: targetPeriodId,
                // Keep name, criteria, method, etc.
                // Ensure 'recoversAssignmentIds' is cleared as it's specific to the old class context
                recoversAssignmentIds: [] 
            };

            const updatedClasses = [...prev.classes];
            updatedClasses[targetClassIndex] = {
                ...updatedClasses[targetClassIndex],
                assignments: [...updatedClasses[targetClassIndex].assignments, newAssignment]
            };

            return { ...prev, classes: updatedClasses };
        });
        alert("Tarea copiada con éxito.");
    }, [updateState]);

    const handleUpdateJournalEntry = useCallback((entry: JournalEntry) => {
        updateState(prev => {
            const existing = prev.journalEntries.find(e => e.id === entry.id);
            if (existing) {
                return { ...prev, journalEntries: prev.journalEntries.map(e => e.id === entry.id ? entry : e) };
            }
            return { ...prev, journalEntries: [...prev.journalEntries, entry] };
        });
    }, [updateState]);

    const setClassesCallback = useCallback((updater: React.SetStateAction<ClassData[]>) => updateState(prev => ({ ...prev, classes: typeof updater === 'function' ? updater(prev.classes) : updater })), [updateState]);
    const setCoursesCallback = useCallback((updater: React.SetStateAction<Course[]>) => updateState(prev => ({ ...prev, courses: typeof updater === 'function' ? updater(prev.courses) : updater })), [updateState]);
    const setKeyCompetencesCallback = useCallback((updater: React.SetStateAction<KeyCompetence[]>) => updateState(prev => ({ ...prev, keyCompetences: typeof updater === 'function' ? updater(prev.keyCompetences) : updater })), [updateState]);
    const setSpecificCompetencesCallback = useCallback((updater: React.SetStateAction<SpecificCompetence[]>) => updateState(prev => ({ ...prev, competences: typeof updater === 'function' ? updater(prev.competences) : updater })), [updateState]);
    const setEvaluationCriteriaCallback = useCallback((updater: React.SetStateAction<EvaluationCriterion[]>) => updateState(prev => ({ ...prev, criteria: typeof updater === 'function' ? updater(prev.criteria) : updater })), [updateState]);
    const setJournalEntriesCallback = useCallback((updater: React.SetStateAction<JournalEntry[]>) => updateState(prev => ({ ...prev, journalEntries: typeof updater === 'function' ? updater(prev.journalEntries) : updater })), [updateState]);
    const setBasicKnowledgeCallback = useCallback((updater: React.SetStateAction<BasicKnowledge[]>) => updateState(prev => ({ ...prev, basicKnowledge: typeof updater === 'function' ? updater(prev.basicKnowledge) : updater })), [updateState]);
    const setAcademicConfigurationCallback = useCallback((updater: React.SetStateAction<AcademicConfiguration>) => updateState(prev => ({ ...prev, academicConfiguration: typeof updater === 'function' ? updater(prev.academicConfiguration) : updater })), [updateState]);
    const setProgrammingUnitsCallback = useCallback((updater: (prev: ProgrammingUnit[]) => ProgrammingUnit[]) => updateState(prev => ({ ...prev, programmingUnits: updater(prev.programmingUnits) })), [updateState]);
    const setEvaluationToolsCallback = useCallback((updater: React.SetStateAction<EvaluationTool[]>) => updateState(prev => ({ ...prev, evaluationTools: typeof updater === 'function' ? updater(prev.evaluationTools) : updater })), [updateState]);


    // --- Render Logic ---
    if (loading) {
        return <div className="flex items-center justify-center min-h-screen bg-slate-100 text-slate-600">Cargando base de datos...</div>;
    }

    if (error) {
        return <div className="flex items-center justify-center min-h-screen bg-red-50 text-red-700">Error: {error}</div>;
    }

    if (!appState) {
        return <div className="flex items-center justify-center min-h-screen bg-slate-100 text-slate-600">Inicializando...</div>;
    }

    const { classes, criteria, competences, keyCompetences, journalEntries, courses, programmingUnits, basicKnowledge, academicConfiguration, evaluationTools } = appState;
    const academicClasses = classes.filter(c => courses.find(course => course.id === c.courseId)?.type !== 'other');
    const activeClassJournalEntries = journalEntries.filter(e => e.classId === activeClassId);
    
    const renderContent = () => {
        // Special handling for Journal which no longer requires an Active Class
        if (activeView === 'journal') {
            return <ClassJournal 
                classes={classes} 
                entries={journalEntries} 
                onSave={handleUpdateJournalEntry} 
                academicConfiguration={academicConfiguration} 
                units={programmingUnits} 
                courses={courses} 
            />;
        }

        if (!activeClass && activeView !== 'calendar') {
            return <div className="p-8 text-center text-slate-500">Por favor, selecciona una clase para empezar o crea una nueva en Ajustes.</div>;
        }

        const reportViews: View[] = ['criteria', 'competences', 'key-competences', 'descriptors'];
        if (reportViews.includes(activeView)) {
            const activeClassCriteria = criteria.filter(c => c.courseId === activeClass?.courseId);
            const activeClassCompetences = competences.filter(sc => sc.courseId === activeClass?.courseId);
            return (
                <>
                    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg mb-6 w-fit">
                        <button onClick={() => setActiveView('criteria')} className={`px-3 py-1.5 text-sm font-semibold rounded-md ${activeView === 'criteria' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'}`}>Inf. Criterios</button>
                        <button onClick={() => setActiveView('competences')} className={`px-3 py-1.5 text-sm font-semibold rounded-md ${activeView === 'competences' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'}`}>Inf. Competencias</button>
                        <button onClick={() => setActiveView('key-competences')} className={`px-3 py-1.5 text-sm font-semibold rounded-md ${activeView === 'key-competences' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'}`}>Inf. Comp. Clave</button>
                        <button onClick={() => setActiveView('descriptors')} className={`px-3 py-1.5 text-sm font-semibold rounded-md ${activeView === 'descriptors' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'}`}>Inf. Descriptores</button>
                    </div>

                    {activeView === 'criteria' && activeClass && <CriteriaAchievement classData={activeClass} criteria={activeClassCriteria} competences={activeClassCompetences} academicConfiguration={academicConfiguration} />}
                    {activeView === 'competences' && activeClass && <SpecificCompetenceAchievement classData={activeClass} competences={activeClassCompetences} keyCompetences={keyCompetences} criteria={activeClassCriteria} academicConfiguration={academicConfiguration} />}
                    {activeView === 'key-competences' && activeClass && <KeyCompetenceAchievement classData={activeClass} competences={activeClassCompetences} keyCompetences={keyCompetences} criteria={activeClassCriteria} academicConfiguration={academicConfiguration} />}
                    {activeView === 'descriptors' && activeClass && <DescriptorAchievement classData={activeClass} keyCompetences={keyCompetences} courses={courses} />}
                </>
            );
        }

        switch (activeView) {
            case 'gradebook':
                return activeClass && <GradebookTable 
                    classData={activeClass} 
                    allClasses={classes} 
                    allCourses={courses}
                    criteria={criteria.filter(c => c.courseId === activeClass.courseId)} 
                    specificCompetences={competences.filter(sc => sc.courseId === activeClass.courseId)} 
                    keyCompetences={keyCompetences} 
                    programmingUnits={programmingUnits} 
                    academicConfiguration={academicConfiguration} 
                    setAcademicConfiguration={setAcademicConfigurationCallback} 
                    onUpdateClass={handleUpdateClass} 
                    evaluationTools={evaluationTools}
                    setActiveClassId={setActiveClassId} // Pass setter for internal tab navigation
                    onCopyAssignment={handleCopyAssignment}
                />;
            case 'calendar':
                return <CalendarView 
                    units={programmingUnits} 
                    setUnits={setProgrammingUnitsCallback} 
                    courses={courses} 
                    academicConfiguration={academicConfiguration} 
                    classes={classes} 
                    journalEntries={journalEntries} 
                    onUpdateClass={handleUpdateClass} 
                    criteria={criteria} 
                    specificCompetences={competences} 
                    keyCompetences={keyCompetences} 
                    onSaveJournalEntry={handleUpdateJournalEntry}
                />;
            default:
                return null;
        }
    };

    return (
        <div className="app-container font-sans text-slate-800 bg-slate-100 min-h-screen flex flex-col">
            <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 py-2 flex items-center justify-between sticky top-0 z-40">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-slate-800">Cuaderno Docente</span>
                    </div>
                    <div className="h-6 w-px bg-slate-200"></div>
                    <nav className="flex items-center gap-2">
                        <button
                            onClick={() => { setActiveView('calendar'); setNotebookOpen(false); }}
                            className={`px-3 py-1.5 text-sm font-semibold rounded-md ${activeView === 'calendar' ? 'bg-slate-200 text-slate-800' : 'hover:bg-slate-100 text-slate-600'}`}
                        >
                            Calendario
                        </button>
                        
                        <div className="relative" ref={notebookRef}>
                            <button
                                onClick={() => setNotebookOpen(o => !o)}
                                className={`px-3 py-1.5 text-sm font-semibold rounded-md flex items-center gap-1 ${['gradebook', 'criteria', 'competences', 'key-competences', 'descriptors'].includes(activeView) ? 'bg-slate-200 text-slate-800' : 'hover:bg-slate-100 text-slate-600'}`}
                            >
                                Cuaderno <ChevronDownIcon className="w-4 h-4" />
                            </button>
                            {notebookOpen && (
                                <div className="absolute top-full mt-2 w-60 bg-white rounded-lg shadow-xl border z-50 p-2">
                                    <button onClick={() => { setActiveView('gradebook'); setNotebookOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 rounded-md">Calificaciones</button>
                                    <button onClick={() => { setActiveView('criteria'); setNotebookOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 rounded-md">Informes</button>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => { setActiveView('journal'); setNotebookOpen(false); }}
                            className={`px-3 py-1.5 text-sm font-semibold rounded-md ${activeView === 'journal' ? 'bg-slate-200 text-slate-800' : 'hover:bg-slate-100 text-slate-600'}`}
                        >
                            Diario de Clase
                        </button>
                    </nav>
                </div>
                <div className="flex items-center gap-2">
                    {/* Hide global class selector when in Gradebook view to avoid redundancy with new tabs, also hide in Journal view */}
                    {activeView !== 'calendar' && activeView !== 'gradebook' && activeView !== 'journal' && academicClasses.length > 0 && (
                        <select
                            value={activeClassId}
                            onChange={(e) => setActiveClassId(e.target.value)}
                            className="p-2 border border-slate-300 rounded-lg text-sm font-semibold bg-white"
                        >
                            {academicClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    )}
                    <button onClick={() => setIsSettingsModalOpen(true)} className="p-2 rounded-full hover:bg-slate-100">
                        <Cog8ToothIcon className="w-6 h-6 text-slate-600" />
                    </button>
                </div>
            </header>
            
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                {renderContent()}
            </main>
            
            <div className="fixed bottom-4 right-4 z-50 flex flex-col items-center">
                <Logo className="w-10 h-10 text-slate-800 opacity-40" />
                <p className="text-[9px] font-semibold text-slate-800 opacity-40">Lost tale</p>
                <a 
                    href="http://creativecommons.org/licenses/by-nc/4.0/" 
                    rel="license" 
                    target="_blank" 
                    className="text-[10px] font-semibold text-slate-800 opacity-40 hover:opacity-80 transition-opacity"
                >
                    CC BY-NC
                </a>
            </div>

            <SettingsModal 
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                onOpenExportModal={() => { setIsSettingsModalOpen(false); setIsExportModalOpen(true); }}
                classes={classes} setClasses={setClassesCallback}
                courses={courses} setCourses={setCoursesCallback}
                keyCompetences={keyCompetences} setKeyCompetences={setKeyCompetencesCallback}
                specificCompetences={competences} setSpecificCompetences={setSpecificCompetencesCallback}
                evaluationCriteria={criteria} setEvaluationCriteria={setEvaluationCriteriaCallback}
                journalEntries={journalEntries} setJournalEntries={setJournalEntriesCallback}
                basicKnowledge={basicKnowledge} setBasicKnowledge={setBasicKnowledgeCallback}
                academicConfiguration={academicConfiguration} setAcademicConfiguration={setAcademicConfigurationCallback}
                programmingUnits={programmingUnits} setProgrammingUnits={setProgrammingUnitsCallback}
                evaluationTools={evaluationTools} setEvaluationTools={setEvaluationToolsCallback}
                importDatabase={importDatabase}
                exportDatabase={exportDatabase}
                resetDatabase={resetDatabase}
            />

            <ExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                classes={classes}
                courses={courses}
                keyCompetences={keyCompetences}
                specificCompetences={competences}
                evaluationCriteria={criteria}
                programmingUnits={programmingUnits}
                basicKnowledge={basicKnowledge}
                academicConfiguration={academicConfiguration}
            />
        </div>
    );
};

export default App;
