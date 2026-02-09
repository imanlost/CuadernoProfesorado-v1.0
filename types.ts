
export interface OperationalDescriptor {
  id: string;
  code: string;
  description: string;
}

export interface KeyCompetence {
  id: string;
  code: string;
  description: string;
  descriptors: OperationalDescriptor[];
}

export interface EvaluationCriterion {
  id: string;
  code: string;
  description: string;
  competenceId: string; // Links to SpecificCompetence id
  courseId: string; // Links to Course id
}

export interface SpecificCompetence {
  id: string;
  code: string;
  description: string;
  keyCompetenceDescriptorIds: string[]; // Links to OperationalDescriptor ids
  courseId: string; // Links to Course id
}

export interface Student {
  id:string;
  name: string;
  acneae: string[]; // For educational needs tags: ['RE', 'ACS']
}

export interface LinkedCriterion {
    criterionId: string;
    ratio: number;
    selectedDescriptorIds: string[];
}

export interface Category {
  id: string;
  name: string;
  weight: number;
  evaluationPeriodId: string;
  type?: 'normal' | 'recovery';
}

// --- Tipos de Instrumentos de Evaluación ---

export interface EvaluationLevel {
  id: string;
  name: string; // e.g., 'Iniciado', 'En Proceso', 'Conseguido'
  points: number; // e.g., 1, 2, 3
}

export interface BaseEvaluationItem {
  id: string;
  description: string;
  weight: number;
  linkedCriteriaIds: string[];
}

export interface Checklist {
  id: string;
  type: 'checklist';
  name: string;
  items: BaseEvaluationItem[];
}

export interface RatingScale {
  id: string;
  type: 'rating_scale';
  name: string;
  levels: EvaluationLevel[];
  items: BaseEvaluationItem[];
}

export interface RubricItem extends BaseEvaluationItem {
  levelDescriptions: Record<string, string>; // { levelId: 'Description for this specific level' }
}

export interface Rubric {
  id: string;
  type: 'rubric';
  name: string;
  levels: EvaluationLevel[];
  items: RubricItem[];
}

export type EvaluationTool = Checklist | RatingScale | Rubric;

// --- Fin de Tipos de Instrumentos ---

export interface Assignment {
  id: string;
  name: string;
  categoryId: string;
  evaluationPeriodId: string;
  date?: string; // YYYY-MM-DD
  
  evaluationMethod: 'direct_grade' | 'checklist' | 'rating_scale' | 'rubric';
  evaluationToolId?: string; // Links to an EvaluationTool's id
  
  linkedCriteria: LinkedCriterion[]; // Usado solo para 'direct_grade'
  programmingUnitId?: string; // Links to ProgrammingUnit id
  recoversAssignmentIds?: string[];
}

export interface Grade {
  studentId: string;
  assignmentId: string;
  criterionScores: Record<string, number | null>; // { criterionId: score }. Siempre se calcula y se guarda.
  toolResults?: Record<string, boolean | string>; // { itemId: checked } for checklist, { itemId: levelId } for scale/rubric
}

export interface Course {
    id: string;
    level: string; // e.g., '3º ESO', '1º Bachillerato'
    subject: string;
    type?: 'academic' | 'other';
}

export interface SessionDetail {
    description: string;
    color?: string;
}

export interface ProgrammingUnit {
    id: string;
    courseId: string;
    name: string;
    sessions: number;
    startDate?: string; // YYYY-MM-DD. Optional fixed start date.
    sessionDetails: SessionDetail[];
    linkedCriteriaIds: string[];
    linkedBasicKnowledgeIds: string[];
}

export interface ClassData {
  id: string;
  name: string;
  courseId: string;
  students: Student[];
  categories: Category[];
  assignments: Assignment[];
  grades: Grade[];
  schedule?: { day: number; periodIndex: number }[]; // 1 for Mon, 2 for Tue, ..., 5 for Fri
  skippedDays?: string[]; // YYYY-MM-DD
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  classId: string;
  notes: string;
}

export interface BasicKnowledge {
  id: string;
  courseId: string;
  code: string;
  description: string;
}

export interface Holiday {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export interface EvaluationPeriod {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export interface GradeScaleRule {
    min: number;
    color: 'red' | 'orange' | 'yellow' | 'lime' | 'green' | 'emerald' | 'teal' | 'blue' | 'indigo' | 'violet' | 'gray';
    label?: string;
}

export interface AcademicConfiguration {
  academicYearStart: string; // YYYY-MM-DD
  academicYearEnd: string; // YYYY-MM-DD
  holidays: Holiday[];
  evaluationPeriods: EvaluationPeriod[];
  evaluationPeriodWeights?: Record<string, number>;
  layoutMode?: 'mobile' | 'tablet' | 'desktop';
  periods?: string[];
  defaultStartView?: 'calendar' | 'gradebook' | 'journal';
  defaultCalendarView?: 'month' | 'week' | 'day';
  gradeScale?: GradeScaleRule[];
}
