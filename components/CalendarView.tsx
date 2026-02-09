
import React, { useState, useMemo, useEffect } from 'react';
import type { ProgrammingUnit, Course, AcademicConfiguration, ClassData, JournalEntry, EvaluationPeriod, Assignment, EvaluationCriterion, SpecificCompetence, KeyCompetence, SessionDetail } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon, ViewWeekIcon, ViewDayIcon, PencilIcon, ClipboardDocumentIcon, PlusIcon, BookOpenIcon } from './Icons';
import SessionActionModal from './SessionActionModal';
import CalendarTaskModal from './CalendarTaskModal';

export interface CalendarEvent {
    id: string;
    date: Date;
    unitId?: string;
    unitName?: string; // Made optional as assignments might not have it directly if standalone
    sessionNumber?: number;
    totalSessions?: number;
    description?: string; // Planned description
    journalNote?: string; // Actual journal entry note
    courseId: string;
    classId: string;
    className: string;
    color?: string;
    courseColor: { backgroundColor: string, textColor: string, borderColor: string };
    eventType: 'session' | 'assignment' | 'otherActivity';
    assignmentId?: string; // For standalone assignments
    assignments?: Assignment[]; // For assignments merged into a session
    periodIndex?: number;
    periodName?: string;
    isGapSession?: boolean;
}

interface CalendarViewProps {
    units: ProgrammingUnit[];
    courses: Course[];
    academicConfiguration: AcademicConfiguration;
    classes: ClassData[];
    journalEntries: JournalEntry[];
    onUpdateClass: (updatedClass: ClassData) => void;
    criteria: EvaluationCriterion[];
    setUnits: (updater: React.SetStateAction<ProgrammingUnit[]>) => void;
    specificCompetences: SpecificCompetence[];
    keyCompetences: KeyCompetence[];
    onSaveJournalEntry: (entry: JournalEntry) => void;
}

// --- Date Helpers (UTC) ---
const addMonthsUTC = (date: Date, months: number) => {
    const d = new Date(date);
    d.setUTCMonth(d.getUTCMonth() + months);
    return d;
};

const addDaysUTC = (date: Date, days: number) => {
    const d = new Date(date);
    d.setUTCDate(d.getUTCDate() + days);
    return d;
};

const startOfMonthUTC = (date: Date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
const endOfMonthUTC = (date: Date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));

const startOfWeekUTC = (date: Date) => {
    const d = new Date(date);
    const day = d.getUTCDay(); // getUTCDay() returns 0 for Sunday, 1 for Monday, etc.
    const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff));
};

const toYYYYMMDD_UTC = (date: Date): string => {
    const y = date.getUTCFullYear();
    const m = date.getUTCMonth() + 1;
    const d = date.getUTCDate();
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
};


// --- Color Helper ---
const getContrastingTextColor = (hexcolor: string): string => {
    if (!hexcolor) return '#000000';
    if (hexcolor.startsWith('#')) {
        hexcolor = hexcolor.slice(1);
    }
    if (hexcolor.length === 3) {
        hexcolor = hexcolor.split('').map(char => char + char).join('');
    }
    const r = parseInt(hexcolor.substring(0, 2), 16);
    const g = parseInt(hexcolor.substring(2, 4), 16);
    const b = parseInt(hexcolor.substring(4, 6), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#FFFFFF';
};

const getClassColor = (courseLevel: string, className: string): { backgroundColor: string, textColor: string, borderColor: string } => {
    let hue: number;

    if (/1º\s*ESO/i.test(courseLevel)) hue = 210;        // Blue tones
    else if (/2º\s*ESO/i.test(courseLevel)) hue = 30;   // Orange tones
    else if (/3º\s*ESO/i.test(courseLevel)) hue = 140;  // Green tones
    else if (/4º\s*ESO/i.test(courseLevel)) hue = 270;  // Violet tones
    else if (/1º\s*Bach/i.test(courseLevel)) hue = 55;  // Yellow tones
    else if (/2º\s*Bach/i.test(courseLevel)) hue = 0;    // Red tones
    else { // Fallback for other courses
        let hash = 0;
        for (let i = 0; i < (courseLevel || '').length; i++) {
            hash = courseLevel.charCodeAt(i) + ((hash << 5) - hash);
            hash = hash & hash;
        }
        hue = Math.abs(hash % 360);
    }

    // Variation from class name for saturation and lightness
    let classHash = 0;
    for (let i = 0; i < className.length; i++) {
        classHash = className.charCodeAt(i) + ((classHash << 5) - classHash);
    }
    // Make variation more pronounced
    const saturationOffset = Math.abs(classHash % 20); // 0-19
    const lightnessOffset = Math.abs(Math.floor(classHash / 20) % 15); // 0-14

    const saturation = 65 + saturationOffset; // e.g., 65-84%
    const lightness = 88 - lightnessOffset;   // e.g., 88-74%

    return {
        backgroundColor: `hsla(${hue}, ${saturation}%, ${lightness}%, 1)`,
        textColor: `hsla(${hue}, 60%, 30%, 1)`, // slightly darker text for better contrast
        borderColor: `hsla(${hue}, ${saturation-10}%, ${lightness-10}%, 1)`,
    };
};


const CalendarView: React.FC<CalendarViewProps> = ({ units, setUnits, courses, academicConfiguration, classes, journalEntries, onUpdateClass, criteria, specificCompetences, keyCompetences, onSaveJournalEntry }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<'month' | 'week' | 'day'>('month');
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [selectedDateForTask, setSelectedDateForTask] = useState<Date | null>(null);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (!initialized && academicConfiguration) {
            const defaultView = academicConfiguration.defaultCalendarView || 'month';
            setView(defaultView);
            setInitialized(true);
        }
    }, [academicConfiguration, initialized]);
    
    const isHoliday = useMemo(() => {
        if (!academicConfiguration || !Array.isArray(academicConfiguration.holidays)) {
            return () => false;
        }
        const holidayRanges = academicConfiguration.holidays
            .filter(h => h.startDate && h.endDate)
            .map(h => ({
                start: new Date(h.startDate + 'T00:00:00Z'),
                end: new Date(h.endDate + 'T00:00:00Z')
            }));
        
        return (date: Date): boolean => {
            const dateOnly = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
            return holidayRanges.some(range => dateOnly >= range.start && dateOnly <= range.end);
        };
    }, [academicConfiguration.holidays]);

    const events = useMemo<CalendarEvent[]>(() => {
        if (!academicConfiguration?.academicYearStart || !academicConfiguration.academicYearEnd) {
            return [];
        }

        const generatedEvents: CalendarEvent[] = [];
        const sessionEventMap = new Map<string, CalendarEvent>(); // Map Key: classId-YYYY-MM-DD (to merge assignments)

        const { academicYearStart, academicYearEnd, periods = [] } = academicConfiguration;
        const startDate = new Date(academicYearStart + 'T00:00:00Z');
        const endDate = new Date(academicYearEnd + 'T00:00:00Z');
        
        const schoolDays: Date[] = [];
        let currentDateIterator = new Date(startDate);
        while (currentDateIterator <= endDate) {
            const dayOfWeek = currentDateIterator.getUTCDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isHoliday(currentDateIterator)) {
                schoolDays.push(new Date(currentDateIterator));
            }
            currentDateIterator = addDaysUTC(currentDateIterator, 1);
        }

        // 1. Generate Sessions (Classes and Other Activities)
        classes.forEach(classData => {
            const course = courses.find(c => c.id === classData.courseId);
            if (!course || !classData.schedule || classData.schedule.length === 0) return;

            const courseColor = getClassColor(course.level, classData.name);
            const skippedDaysSet = new Set(classData.skippedDays || []);

            // Filter sessions for this specific class from the global school days
            const classSessionSlots: { date: Date, periodIndex: number }[] = [];
            schoolDays.forEach(day => {
                if (skippedDaysSet.has(toYYYYMMDD_UTC(day))) return;
                
                const slotsForDay = classData.schedule!.filter(s => s.day === day.getUTCDay());
                slotsForDay.sort((a, b) => a.periodIndex - b.periodIndex);
                
                slotsForDay.forEach(slot => {
                    classSessionSlots.push({ date: day, periodIndex: slot.periodIndex });
                });
            });

            if (course.type === 'other') {
                classSessionSlots.forEach(slot => {
                    const event: CalendarEvent = {
                        id: `${classData.id}-${toYYYYMMDD_UTC(slot.date)}-${slot.periodIndex}`,
                        date: slot.date,
                        eventType: 'otherActivity',
                        unitName: classData.name,
                        description: course.subject,
                        courseId: classData.courseId,
                        classId: classData.id,
                        className: classData.name,
                        courseColor: { backgroundColor: '#f1f5f9', textColor: '#475569', borderColor: '#cbd5e1' },
                        periodIndex: slot.periodIndex,
                        periodName: periods[slot.periodIndex] || `Periodo ${slot.periodIndex + 1}`,
                    };
                    generatedEvents.push(event);
                });
            } else {
                const unitsForClass = units.filter(u => u.courseId === classData.courseId);
                let unitIndex = 0;
                let sessionInUnit = 0;

                for (let i = 0; i < classSessionSlots.length; i++) {
                    const slot = classSessionSlots[i];
                    const slotDateStr = toYYYYMMDD_UTC(slot.date);

                    // Find if there is a journal entry for this class/date
                    const journalEntry = journalEntries.find(e => e.classId === classData.id && e.date === slotDateStr);

                    // Anchor check
                    const anchorUnitIndex = unitsForClass.findIndex(u => u.startDate === slotDateStr);
                    
                    if (anchorUnitIndex !== -1) {
                        unitIndex = anchorUnitIndex;
                        sessionInUnit = 0;
                    }

                    if (unitIndex >= unitsForClass.length) break;

                    const unit = unitsForClass[unitIndex];
                    const nextUnitAnchor = unitIndex < unitsForClass.length - 1 ? unitsForClass[unitIndex + 1].startDate : null;
                    const isOverflow = sessionInUnit >= unit.sessions;
                    
                    if (sessionInUnit >= unit.sessions) {
                        if (!nextUnitAnchor) {
                            unitIndex++;
                            sessionInUnit = 0;
                            if (unitIndex < unitsForClass.length) {
                                i--; 
                                continue;
                            } else {
                                break;
                            }
                        }
                    }

                    const currentUnitObj = unitsForClass[unitIndex];
                    const details = currentUnitObj.sessionDetails || [];
                    const detail = details[sessionInUnit] || { description: '' };
                    
                    const sessionEvent: CalendarEvent = {
                        id: `${classData.id}-${currentUnitObj.id}-s${sessionInUnit + 1}-${i}`,
                        date: slot.date,
                        eventType: 'session',
                        unitId: currentUnitObj.id,
                        unitName: currentUnitObj.name,
                        sessionNumber: sessionInUnit + 1,
                        totalSessions: Math.max(currentUnitObj.sessions, sessionInUnit + 1),
                        description: detail.description || (isOverflow ? '(Sesión extra)' : ''),
                        journalNote: journalEntry?.notes, // Bind Journal Entry
                        courseId: currentUnitObj.courseId,
                        classId: classData.id,
                        className: classData.name,
                        color: detail.color,
                        courseColor: courseColor,
                        periodIndex: slot.periodIndex,
                        periodName: periods[slot.periodIndex] || `Periodo ${slot.periodIndex + 1}`,
                        isGapSession: isOverflow,
                        assignments: [] // Initialize assignments array
                    };

                    generatedEvents.push(sessionEvent);
                    // Store in map for assignment merging. 
                    const key = `${classData.id}-${slotDateStr}`;
                    if (!sessionEventMap.has(key)) {
                        sessionEventMap.set(key, sessionEvent);
                    }

                    sessionInUnit++;
                }
            }
        });

        // 2. Process Assignments (Merge into Sessions or Create Standalone)
        classes.forEach(classData => {
            if (!classData.assignments) return;
            
            const course = courses.find(c => c.id === classData.courseId);
            const courseColor = course ? getClassColor(course.level, classData.name) : { backgroundColor: '#ddd', textColor: '#333', borderColor: '#ccc' };

            classData.assignments.forEach(assignment => {
                if (assignment.date) {
                    const key = `${classData.id}-${assignment.date}`;
                    const existingSession = sessionEventMap.get(key);

                    if (existingSession) {
                        // MERGE: Add to existing session
                        if (!existingSession.assignments) existingSession.assignments = [];
                        existingSession.assignments.push(assignment);
                    } else {
                        // STANDALONE
                        const assignmentDate = new Date(assignment.date + 'T00:00:00Z');
                        generatedEvents.push({
                            id: `${classData.id}-${assignment.id}`,
                            date: assignmentDate,
                            eventType: 'assignment',
                            assignmentId: assignment.id,
                            unitName: assignment.name,
                            description: `Tarea: ${assignment.name}`,
                            courseId: classData.courseId,
                            classId: classData.id,
                            className: classData.name,
                            courseColor: courseColor,
                            periodIndex: undefined, 
                            periodName: undefined
                        });
                    }
                }
            });
        });

        return generatedEvents.sort((a, b) => {
            const dateDiff = a.date.getTime() - b.date.getTime();
            if (dateDiff !== 0) return dateDiff;
            return (a.periodIndex ?? 99) - (b.periodIndex ?? 99);
        });
    }, [classes, courses, units, academicConfiguration, isHoliday, journalEntries]);

    const handleEventClick = (event: CalendarEvent) => {
        if (event.eventType === 'session') {
            setSelectedEvent(event);
            setIsActionModalOpen(true);
        }
    };
    
    const handleOpenTaskModal = (date: Date) => {
        setSelectedDateForTask(date);
        setIsTaskModalOpen(true);
    };

    const handleSaveTask = (newAssignment: Omit<Assignment, 'id'>, classId: string) => {
        const classToUpdate = classes.find(c => c.id === classId);
        if (!classToUpdate) return;
    
        const fullAssignment: Assignment = {
            ...newAssignment,
            id: `a-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
        };
    
        const updatedClass = {
            ...classToUpdate,
            assignments: [...classToUpdate.assignments, fullAssignment]
        };
        onUpdateClass(updatedClass);
        setIsTaskModalOpen(false);
    };

    const handleCancelSession = (classId: string, date: Date) => {
        const classToUpdate = classes.find(c => c.id === classId);
        if (classToUpdate) {
            const dateString = toYYYYMMDD_UTC(date);
            const updatedSkippedDays = Array.from(new Set([...(classToUpdate.skippedDays || []), dateString]));
            onUpdateClass({ ...classToUpdate, skippedDays: updatedSkippedDays });
        }
    };

    const handleUpdateSessionDescription = (unitId: string, sessionNumber: number, newDescription: string) => {
        // Changed behavior: Editing a session in Calendar now creates/updates a Journal Entry,
        // it does NOT overwrite the original plan (ProgrammingUnit).
        if (selectedEvent) {
            const dateStr = toYYYYMMDD_UTC(selectedEvent.date);
            const existingEntry = journalEntries.find(e => e.classId === selectedEvent.classId && e.date === dateStr);
            
            const newEntry: JournalEntry = {
                id: existingEntry ? existingEntry.id : `j-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                classId: selectedEvent.classId,
                date: dateStr,
                notes: newDescription
            };
            
            onSaveJournalEntry(newEntry);
        }
    };

    const handleInsertAndDisplaceSession = (unitId: string, sessionNumber: number, newDescription: string) => {
        setUnits(prevUnits => prevUnits.map(unit => {
            if (unit.id === unitId) {
                const newSessionDetail: SessionDetail = { description: newDescription };
                const sessionIndexToInsertAfter = sessionNumber - 1;
                
                const updatedSessionDetails = [...unit.sessionDetails];
                updatedSessionDetails.splice(sessionIndexToInsertAfter + 1, 0, newSessionDetail);

                return {
                    ...unit,
                    sessions: unit.sessions + 1,
                    sessionDetails: updatedSessionDetails,
                };
            }
            return unit;
        }));
        setIsActionModalOpen(false);
    };

    const handlePrev = () => {
        if (view === 'month') setCurrentDate(addMonthsUTC(currentDate, -1));
        if (view === 'week') setCurrentDate(addDaysUTC(currentDate, -7));
        if (view === 'day') setCurrentDate(addDaysUTC(currentDate, -1));
    };
    
    const handleNext = () => {
        if (view === 'month') setCurrentDate(addMonthsUTC(currentDate, 1));
        if (view === 'week') setCurrentDate(addDaysUTC(currentDate, 7));
        if (view === 'day') setCurrentDate(addDaysUTC(currentDate, 1));
    };
    
    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const renderHeader = () => (
        <div className="flex items-center justify-between p-4 border-b bg-slate-50/50 rounded-t-xl">
            <div className="flex items-center gap-4">
                 <h2 className="text-xl font-bold text-slate-800">
                    {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' })}
                </h2>
                <div className="flex items-center border rounded-lg">
                    <button onClick={handlePrev} className="p-2 text-slate-500 hover:bg-slate-200 rounded-l-md"><ChevronLeftIcon className="w-5 h-5"/></button>
                    <button onClick={handleToday} className="px-3 py-1.5 text-sm font-semibold border-x hover:bg-slate-200">Hoy</button>
                    <button onClick={handleNext} className="p-2 text-slate-500 hover:bg-slate-200 rounded-r-md"><ChevronRightIcon className="w-5 h-5"/></button>
                </div>
            </div>
            <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
                <button onClick={() => setView('month')} className={`px-3 py-1 text-sm font-semibold rounded-md flex items-center gap-1.5 ${view === 'month' ? 'bg-white shadow-sm' : 'hover:bg-slate-300/50'}`}>
                    <CalendarDaysIcon className="w-4 h-4" /> Mes
                </button>
                <button onClick={() => setView('week')} className={`px-3 py-1 text-sm font-semibold rounded-md flex items-center gap-1.5 ${view === 'week' ? 'bg-white shadow-sm' : 'hover:bg-slate-300/50'}`}>
                    <ViewWeekIcon className="w-4 h-4" /> Semana
                </button>
                <button onClick={() => setView('day')} className={`px-3 py-1 text-sm font-semibold rounded-md flex items-center gap-1.5 ${view === 'day' ? 'bg-white shadow-sm' : 'hover:bg-slate-300/50'}`}>
                    <ViewDayIcon className="w-4 h-4" /> Día
                </button>
            </div>
        </div>
    );
    
    const getPeriodForDate = useMemo(() => {
        const periods = academicConfiguration.evaluationPeriods;
        if (!periods || periods.length === 0) return () => null;

        const periodRanges = periods.map((p, index) => ({
            ...p,
            start: new Date(p.startDate + 'T00:00:00Z'),
            end: new Date(p.endDate + 'T00:00:00Z'),
            index: index
        }));

        return (date: Date): { period: EvaluationPeriod, index: number } | null => {
            const dateOnly = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
            for (const range of periodRanges) {
                if (dateOnly >= range.start && dateOnly <= range.end) {
                    return { period: range, index: range.index };
                }
            }
            return null;
        }
    }, [academicConfiguration.evaluationPeriods]);

    const periodColors = ['bg-violet-100', 'bg-emerald-100', 'bg-amber-100'];

    const renderMonthView = () => {
        const monthStart = startOfMonthUTC(currentDate);
        const monthEnd = endOfMonthUTC(currentDate);
        const startDate = startOfWeekUTC(monthStart);
        const endDate = addDaysUTC(startOfWeekUTC(monthEnd), 6);
        const days = [];
        let day = startDate;

        while (day <= endDate) {
            days.push(day);
            day = addDaysUTC(day, 1);
        }

        return (
            <div>
                {/* Fixed: Sticky Header for days of week */}
                <div className="grid grid-cols-5 text-center font-semibold text-sm text-slate-600 border-b sticky top-0 bg-white z-10 shadow-sm">
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie'].map(d => <div key={d} className="py-2">{d}</div>)}
                </div>
                {/* Fixed: Auto rows and removed fixed height to allow full scrolling */}
                <div className="grid grid-cols-5 auto-rows-fr">
                    {days.map(d => {
                         const dayOfWeek = d.getUTCDay();
                         // Skip Saturday (6) and Sunday (0)
                         if (dayOfWeek === 6 || dayOfWeek === 0) return null;

                         const dayStr = toYYYYMMDD_UTC(d);
                         const eventsForDay = events.filter(e => toYYYYMMDD_UTC(e.date) === dayStr);
                         const isCurrentMonth = d.getUTCMonth() === currentDate.getUTCMonth();
                         const today = new Date();
                         const isToday = d.getUTCFullYear() === today.getUTCFullYear() && d.getUTCMonth() === today.getUTCMonth() && d.getUTCDate() === today.getUTCDate();
                         const isDayHoliday = isHoliday(d);
                         
                         const periodInfo = getPeriodForDate(d);
                         
                         let cellBgClass = 'bg-white';
                         if (isDayHoliday) {
                            cellBgClass = 'bg-rose-50';
                         } else if (periodInfo) {
                            cellBgClass = periodColors[periodInfo.index % periodColors.length] || 'bg-white';
                         } else if (!isCurrentMonth) {
                            cellBgClass = 'bg-slate-50/70';
                         }
                         
                        return (
                             // Fixed: Increased minimum height and removed overflow-y-auto to allow full month scrolling
                             <div key={d.toISOString()} className={`relative border-r border-b p-2 ${cellBgClass} min-h-[12rem] group/day`}>
                                <div className={`flex items-center justify-center w-6 h-6 text-xs rounded-full ${isToday ? 'bg-blue-600 text-white font-bold' : ''}`}>
                                  {d.getUTCDate()}
                                </div>
                                { !isDayHoliday && (
                                    <button 
                                        onClick={() => handleOpenTaskModal(d)}
                                        className="absolute top-1 right-1 w-6 h-6 bg-slate-200/50 text-slate-500 rounded-full flex items-center justify-center opacity-0 group-hover/day:opacity-100 hover:bg-blue-200 hover:text-blue-600 transition-opacity z-10"
                                        title="Añadir tarea calificable"
                                    >
                                        <PlusIcon className="w-4 h-4" />
                                    </button>
                                )}
                                <div className="space-y-1 mt-1">
                                    {eventsForDay.map(event => {
                                        if (event.eventType === 'otherActivity') {
                                            return null; 
                                        }
                                        if (event.eventType === 'session') {
                                            const style = event.color
                                                ? { backgroundColor: event.color, color: getContrastingTextColor(event.color), borderColor: event.color }
                                                : { backgroundColor: event.courseColor.backgroundColor, color: event.courseColor.textColor, borderColor: event.courseColor.borderColor };
                                            
                                            if (event.isGapSession) {
                                                style.backgroundColor = 'transparent';
                                                style.color = '#64748b'; 
                                                style.borderColor = '#cbd5e1'; 
                                            }

                                            return (
                                                <div key={event.id} className={`p-1 text-xs rounded border flex flex-col justify-start items-start ${event.isGapSession ? 'border-dashed' : ''}`} style={style}>
                                                    <div className="flex justify-between w-full items-start">
                                                        <div className="flex-grow truncate pr-1" title={`${event.className} - ${event.unitName}`}>
                                                            <p className="font-semibold truncate flex items-center">
                                                                {event.className} 
                                                                {event.journalNote && <BookOpenIcon className="w-3 h-3 ml-1 flex-shrink-0" />}
                                                            </p>
                                                            <p className="truncate text-[10px]">{event.unitName} (S{event.sessionNumber})</p>
                                                        </div>
                                                        <button onClick={() => handleEventClick(event)} className="flex-shrink-0 opacity-50 hover:opacity-100"><PencilIcon className="w-4 h-4"/></button>
                                                    </div>
                                                    {/* Display Content: Prioritize Journal Note */}
                                                    <div className="w-full mt-0.5 truncate">
                                                        {event.journalNote ? (
                                                            <p className="font-medium truncate italic">📝 {event.journalNote}</p>
                                                        ) : (
                                                            <p className="opacity-80 truncate">{event.description}</p>
                                                        )}
                                                    </div>
                                                    
                                                    {event.assignments && event.assignments.length > 0 && (
                                                        <div className="w-full mt-1 pt-1 border-t border-black/10">
                                                            {event.assignments.map(a => (
                                                                <div key={a.id} className="flex items-center gap-1 text-[10px] opacity-90 font-medium truncate">
                                                                    <ClipboardDocumentIcon className="w-3 h-3 flex-shrink-0"/> {a.name}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        } else { // Standalone Assignment
                                            const style = { backgroundColor: event.courseColor.backgroundColor, color: event.courseColor.textColor, borderColor: event.courseColor.borderColor };
                                            return (
                                                <div key={event.id} className="p-1 text-xs rounded border flex items-start gap-1.5" style={style} title={`${event.className} - ${event.unitName}`}>
                                                   <ClipboardDocumentIcon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 opacity-80"/>
                                                   <div className="truncate">
                                                        <p className="font-semibold truncate">{event.className}</p>
                                                        <p className="truncate">{event.unitName}</p>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        );
    };
    
    const renderGenericDayColumn = (d: Date) => {
        const dayStr = toYYYYMMDD_UTC(d);
        const eventsForDay = events.filter(e => toYYYYMMDD_UTC(e.date) === dayStr);
        const isDayHoliday = isHoliday(d);
        // Weekend check removed from here since this function is now only called for weekdays in Week View
        // But kept for safety if reused.
        const dayOfWeek = d.getUTCDay();
        const isWeekend = dayOfWeek === 6 || dayOfWeek === 0;
        let cellBgClass = 'bg-white';
        if (isDayHoliday || isWeekend) {
             cellBgClass = 'bg-rose-50';
        }

        return (
            <div className={`border-r p-1.5 overflow-y-auto ${cellBgClass}`}>
                <div className="space-y-1 mt-1">
                {eventsForDay.map(event => {
                    let style;
                    if (event.eventType === 'otherActivity') {
                        style = { backgroundColor: '#f1f5f9', color: '#475569', borderColor: '#e2e8f0', borderLeftWidth: '4px' };
                    } else if (event.eventType === 'session' && event.color) {
                        style = { backgroundColor: event.color, color: getContrastingTextColor(event.color), borderColor: event.color, borderLeftWidth: '4px' };
                    } else {
                        style = { backgroundColor: event.courseColor.backgroundColor, color: event.courseColor.textColor, borderColor: event.courseColor.borderColor, borderLeftWidth: '4px' };
                    }

                    if (event.isGapSession) {
                        style.backgroundColor = 'transparent';
                        style.color = '#64748b'; 
                        style.borderColor = '#cbd5e1';
                    }
                    
                    // Render embedded assignments for sessions
                    const renderAssignments = () => {
                        if (!event.assignments || event.assignments.length === 0) return null;
                        return (
                            <div className="mt-2 pt-2 border-t border-black/10 space-y-1">
                                <p className="text-[10px] font-bold opacity-70 uppercase tracking-wider">Tareas:</p>
                                {event.assignments.map(a => (
                                    <div key={a.id} className="flex items-center gap-1.5 text-xs font-medium bg-white/40 p-1 rounded">
                                        <ClipboardDocumentIcon className="w-3.5 h-3.5"/> {a.name}
                                    </div>
                                ))}
                            </div>
                        )
                    }

                    if (event.eventType === 'session') {
                        return (
                            <div key={event.id} className={`p-1.5 text-xs rounded relative group ${event.isGapSession ? 'border border-dashed' : ''}`} style={style}>
                                <p className="font-semibold flex items-center">
                                    {event.periodName ? <span className="mr-1 opacity-75">[{event.periodName}]</span> : null}
                                    {event.className} 
                                    {event.journalNote && <BookOpenIcon className="w-3 h-3 ml-1 flex-shrink-0"/>}
                                </p>
                                <p>{event.unitName} {event.eventType === 'session' && `(S${event.sessionNumber})`}</p>
                                
                                {event.journalNote ? (
                                    <p className="text-xs font-semibold mt-1 truncate">📝 {event.journalNote}</p>
                                ) : (
                                    <p className="text-xs opacity-80 mt-1 truncate">{event.description}</p>
                                )}
                                
                                {renderAssignments()}
                                <button onClick={() => handleEventClick(event)} className="absolute top-1 right-1 p-0.5 rounded-full bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"><PencilIcon className="w-4 h-4"/></button>
                            </div>
                        )
                    } else {
                        // Standalone assignment
                         return (
                            <div key={event.id} className="p-1.5 text-xs rounded border border-l-4 flex items-start gap-1.5" style={style}>
                               <ClipboardDocumentIcon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 opacity-80"/>
                               <div>
                                    <p className="font-semibold">{event.className}</p>
                                    <p>{event.unitName}</p>
                                </div>
                            </div>
                        )
                    }
                })}
                </div>
            </div>
        )
    }

    const renderWeekView = () => {
        const weekStart = startOfWeekUTC(currentDate);
        // Only 5 days (Mon-Fri)
        const days = Array.from({ length: 5 }).map((_, i) => addDaysUTC(weekStart, i));

        return (
            <div>
                {/* Modified to 5 cols */}
                <div className="grid grid-cols-5 text-center font-semibold text-sm text-slate-600 border-b">
                    {days.map(d => {
                        const today = new Date();
                        const isToday = d.getUTCFullYear() === today.getUTCFullYear() && d.getUTCMonth() === today.getUTCMonth() && d.getUTCDate() === today.getUTCDate();
                        return (
                            <div key={d.toISOString()} className="py-2 border-r">
                                <div className="text-xs">{d.toLocaleString('es-ES', { weekday: 'short', timeZone: 'UTC' })}</div>
                                <div className={`text-xl mt-1 ${isToday ? 'text-blue-600 font-bold' : ''}`}>{d.getUTCDate()}</div>
                            </div>
                        )
                    })}
                </div>
                {/* Modified to 5 cols */}
                <div className="grid grid-cols-5 h-[70vh]">
                     {days.map(d => (
                        <React.Fragment key={d.toISOString()}>
                            {renderGenericDayColumn(d)}
                        </React.Fragment>
                     ))}
                </div>
            </div>
        );
    };
    
    const renderDayView = () => {
        const currentDateStr = toYYYYMMDD_UTC(currentDate);
        const eventsForDay = events.filter(e => toYYYYMMDD_UTC(e.date) === currentDateStr);
        const isDayHoliday = isHoliday(currentDate);
        const dayOfWeek = currentDate.getUTCDay();
        const isWeekend = dayOfWeek === 6 || dayOfWeek === 0;
        return (
            <div className={`p-4 h-[70vh] overflow-y-auto ${isDayHoliday || isWeekend ? 'bg-rose-50' : ''}`}>
                 <h3 className="text-lg font-bold text-slate-700 mb-4">{currentDate.toLocaleString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })}</h3>
                 {(isDayHoliday || isWeekend) && <p className="text-center font-semibold text-rose-700 mb-4">Día no lectivo</p>}
                 {eventsForDay.length > 0 ? (
                    <div className="space-y-3">
                    {eventsForDay.map(event => {
                        let style;
                        if (event.eventType === 'otherActivity') {
                            style = { backgroundColor: '#f1f5f9', color: '#475569', borderColor: '#e2e8f0', borderLeftWidth: '4px' };
                        } else if (event.eventType === 'session' && event.color) {
                            style = { backgroundColor: event.color, color: getContrastingTextColor(event.color), borderColor: event.color, borderLeftWidth: '4px' };
                        } else {
                            style = { backgroundColor: event.courseColor.backgroundColor, color: event.courseColor.textColor, borderColor: event.courseColor.borderColor, borderLeftWidth: '4px' };
                        }

                        if (event.isGapSession) {
                            style.backgroundColor = 'transparent';
                            style.color = '#64748b'; 
                            style.borderColor = '#cbd5e1';
                        }
                        
                        // Render embedded assignments
                        const renderAssignments = () => {
                            if (!event.assignments || event.assignments.length === 0) return null;
                            return (
                                <div className="mt-3 pt-3 border-t border-black/10">
                                    <p className="text-xs font-bold opacity-70 uppercase tracking-wider mb-2">Tareas para hoy:</p>
                                    <div className="space-y-2">
                                        {event.assignments.map(a => (
                                            <div key={a.id} className="flex items-center gap-2 p-2 bg-white/50 rounded border border-black/5">
                                                <ClipboardDocumentIcon className="w-4 h-4 text-slate-600"/> 
                                                <span className="font-semibold">{a.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        }

                        if (event.eventType === 'session') {
                            return (
                                <div key={event.id} className={`p-3 rounded-lg relative group ${event.isGapSession ? 'border border-dashed' : ''}`} style={style}>
                                    <p className="font-bold flex items-center text-lg">
                                        {event.periodName ? <span className="mr-2 opacity-75">[{event.periodName}]</span> : null}
                                        {event.className} - {event.unitName} 
                                        {event.journalNote && <BookOpenIcon className="w-5 h-5 ml-2 flex-shrink-0"/>}
                                    </p>
                                    {event.eventType === 'session' && <p className="text-sm font-medium mt-1">Sesión {event.sessionNumber}</p>}
                                    
                                    {event.description && (
                                        <div className="mt-2 p-2 bg-white/40 rounded text-sm">
                                             <span className="font-bold text-xs uppercase tracking-wide opacity-70 block mb-1">Planificado:</span>
                                             {event.description}
                                        </div>
                                    )}
                                    
                                    {event.journalNote && (
                                         <div className="mt-2 p-2 bg-white/70 rounded text-base font-medium border-l-2 border-indigo-500">
                                             <span className="font-bold text-xs uppercase tracking-wide text-indigo-700 block mb-1">Diario:</span>
                                             {event.journalNote}
                                        </div>
                                    )}
                                    
                                    {renderAssignments()}
                                    <button onClick={() => handleEventClick(event)} className="absolute top-2 right-2 p-1 rounded-full bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"><PencilIcon className="w-5 h-5"/></button>
                                </div>
                            );
                        } else {
                             return (
                                <div key={event.id} className="p-3 rounded-lg border-l-4 flex items-center gap-3" style={style}>
                                    <ClipboardDocumentIcon className="w-6 h-6 opacity-80"/>
                                    <div>
                                        <p className="font-bold text-lg">{event.className}</p>
                                        <p className="text-base">{event.unitName}</p>
                                    </div>
                                </div>
                            )
                        }
                    })}
                    </div>
                ) : (
                    !(isDayHoliday || isWeekend) &&
                    <div className="flex items-center justify-center h-full text-slate-500">
                        <p>No hay sesiones programadas para este día.</p>
                    </div>
                )}
            </div>
        )
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm">
                {renderHeader()}
                {view === 'month' && renderMonthView()}
                {view === 'week' && renderWeekView()}
                {view === 'day' && renderDayView()}
            </div>
            <SessionActionModal
                isOpen={isActionModalOpen}
                onClose={() => setIsActionModalOpen(false)}
                event={selectedEvent}
                onCancelSession={handleCancelSession}
                onUpdateSession={handleUpdateSessionDescription}
                onInsertAndDisplaceSession={handleInsertAndDisplaceSession}
            />
            {isTaskModalOpen && selectedDateForTask && (
                <CalendarTaskModal
                    isOpen={isTaskModalOpen}
                    onClose={() => setIsTaskModalOpen(false)}
                    onSave={handleSaveTask}
                    selectedDate={selectedDateForTask}
                    classes={classes}
                    criteria={criteria}
                    specificCompetences={specificCompetences}
                    keyCompetences={keyCompetences}
                    academicConfiguration={academicConfiguration}
                />
            )}
        </>
    );
};

export default CalendarView;
