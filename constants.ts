
import type { KeyCompetence, EvaluationCriterion, SpecificCompetence, ClassData, JournalEntry, Course, OperationalDescriptor, ProgrammingUnit, BasicKnowledge, AcademicConfiguration, EvaluationTool } from './types';

// Constants for ACNEAE tags and their priority order
export const ACNEAE_TAGS = ['RE ACA', 'RE EC', 'RE', 'PRE ES1', 'PRE ES2', 'PRE ES3', 'PRE ES4', 'PAC', 'PAC EP1', 'PAC EP2', 'PAC EP3', 'PAC EP4', 'PAC EP5', 'PAC EP6', 'ACS', 'FPEX', 'NN'];
export const ACNEAE_ORDER = { 'PAC': 1, 'PRE': 1, 'RE ACA': 2, 'RE EC': 2, 'RE': 3 };

// DESCRIPTORES OPERATIVOS LOMLOE - ETAPA ESO
// This section is intentionally left empty. Curriculum should be imported by the user.
const ESO_OPERATIONAL_DESCRIPTORS: Record<string, OperationalDescriptor> = {};

// KEY COMPETENCES
// This section is intentionally left empty. Curriculum should be imported by the user.
export const INITIAL_KEY_COMPETENCES: KeyCompetence[] = [];

// SPECIFIC COMPETENCES
// This section is intentionally left empty. Curriculum should be imported by the user.
export const INITIAL_COMPETENCES: SpecificCompetence[] = [];

// EVALUATION CRITERIA
// This section is intentionally left empty. Curriculum should be imported by the user.
export const INITIAL_CRITERIA: EvaluationCriterion[] = [];

// COURSES
export const INITIAL_COURSES: Course[] = [
    { id: 'course-eso3-bg', level: '3º ESO', subject: 'Biología y Geología' },
    { id: 'course-eso4-bg', level: '4º ESO', subject: 'Biología y Geología' },
];

// PROGRAMMING UNITS
// This section is intentionally left empty. Curriculum should be imported by the user.
export const INITIAL_PROGRAMMING_UNITS: ProgrammingUnit[] = [];

// CLASS DATA
export const INITIAL_CLASS_DATA: ClassData[] = [
  {
    id: 'class-bg3',
    name: 'Biología y Geología 3ºA',
    courseId: 'course-eso3-bg',
    schedule: [
        { day: 1, periodIndex: 0 }, // Lunes, 1ª Hora
        { day: 3, periodIndex: 3 }, // Miércoles, 4ª Hora
        { day: 5, periodIndex: 6 }, // Viernes, 7ª Hora
    ],
    students: [
      { id: 's1', name: 'Elena García', acneae: [] },
      { id: 's2', name: 'Marcos Rodríguez', acneae: ['RE'] },
      { id: 's3', name: 'Lucía Fernández', acneae: ['PAC', 'RE EC'] },
      { id: 's4', name: 'Javier López', acneae: ['ACS'] },
    ],
    categories: [
        { id: 'cat1', name: 'Proyectos', weight: 50, evaluationPeriodId: 'ep-1' },
        { id: 'cat2', name: 'Pruebas', weight: 50, evaluationPeriodId: 'ep-1' },
    ],
    assignments: [], // Emptied to avoid dependency on non-existent criteria
    grades: [], // Emptied to avoid dependency on non-existent assignments
  },
];

// JOURNAL ENTRIES
export const INITIAL_JOURNAL_ENTRIES: JournalEntry[] = [
    { id: 'j1', date: '2024-09-16', classId: 'class-bg3', notes: 'La clase ha mostrado gran interés en el proyecto de investigación de ecosistemas. Marcos necesita un poco más de apoyo para arrancar.' },
];

// BASIC KNOWLEDGE
// This section is intentionally left empty. Curriculum should be imported by the user.
export const INITIAL_BASIC_KNOWLEDGE: BasicKnowledge[] = [];

// EVALUATION TOOLS
export const INITIAL_EVALUATION_TOOLS: EvaluationTool[] = [];

// ACADEMIC CONFIGURATION
export const INITIAL_ACADEMIC_CONFIGURATION: AcademicConfiguration = {
    academicYearStart: '2024-09-09',
    academicYearEnd: '2025-06-20',
    holidays: [
        { id: 'h-1', name: 'Vacaciones de Navidad', startDate: '2024-12-23', endDate: '2025-01-07' },
        { id: 'h-2', name: 'Semana Santa', startDate: '2025-04-14', endDate: '2025-04-21' },
    ],
    evaluationPeriods: [
        { id: 'ep-1', name: '1ª Evaluación', startDate: '2024-09-09', endDate: '2024-12-20' },
        { id: 'ep-2', name: '2ª Evaluación', startDate: '2025-01-08', endDate: '2025-03-28' },
        { id: 'ep-3', name: '3ª Evaluación', startDate: '2025-03-31', endDate: '2025-06-20' },
    ],
    evaluationPeriodWeights: {
        'ep-1': 34,
        'ep-2': 33,
        'ep-3': 33
    },
    layoutMode: 'tablet',
    periods: [
        '1ª Hora (8:00-8:55)',
        '2ª Hora (8:55-9:50)',
        'Recreo (9:50-10:20)',
        '3ª Hora (10:20-11:15)',
        '4ª Hora (11:15-12:10)',
        'Recreo (12:10-12:40)',
        '5ª Hora (12:40-13:35)',
        '6ª Hora (13:35-14:30)',
    ],
    defaultStartView: 'calendar',
    defaultCalendarView: 'month'
};