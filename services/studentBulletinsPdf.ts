import { jsPDF } from 'jspdf';
// Interop robusto: el paquete exporta `autoTable` como named y como default según
// el entorno (Vite/ESM o Node/CJS); se resuelve en tiempo de ejecución.
import * as autoTableNs from 'jspdf-autotable';

const autoTable = ((autoTableNs as any).autoTable
    ?? (autoTableNs as any).default
    ?? autoTableNs) as (doc: any, options: any) => void;
import type {
    ClassData,
    Course,
    KeyCompetence,
    SpecificCompetence,
    EvaluationCriterion,
    AcademicConfiguration,
    EvaluationPeriod,
} from '../types';
import { sortAcneaeTags } from '../constants';
import {
    calculateDetailedPeriodGradeBreakdown,
    calculateEvaluationPeriodGradeForStudent,
    calculateStudentCriterionGrades,
    calculateStudentCompetenceGrades,
    calculateStudentKeyCompetenceGrades,
} from './gradeCalculations';

/**
 * Boletines de calificación en PDF: una página (o bloque) por alumno, con el
 * desglose de la nota de la evaluación, los criterios, las competencias
 * específicas y las competencias clave. Pensado para imprimir por hojas sueltas.
 */

export interface BulletinData {
    classes: ClassData[];
    courses: Course[];
    keyCompetences: KeyCompetence[];
    specificCompetences: SpecificCompetence[];
    evaluationCriteria: EvaluationCriterion[];
    academicConfiguration: AcademicConfiguration;
}

const BLUE: [number, number, number] = [37, 99, 235];
const DARK: [number, number, number] = [15, 23, 42];
const SLATE: [number, number, number] = [71, 85, 105];
const LIGHT: [number, number, number] = [241, 245, 249];
const WHITE: [number, number, number] = [255, 255, 255];

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN_X = 14;
const CONTENT_W = PAGE_W - MARGIN_X * 2;

const fmt = (n: number | null | undefined): string =>
    n === null || n === undefined || Number.isNaN(n) ? '—' : n.toFixed(2).replace('.', ',');

const today = (): string => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

// Recorta por palabras (no a mitad de palabra) para que los criterios largos no
// queden con un «transmi…»; el texto completo está en la app.
const truncate = (text: string, max: number): string => {
    if (text.length <= max) return text;
    const cut = text.slice(0, max - 1);
    const lastSpace = cut.lastIndexOf(' ');
    const clean = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut;
    return `${clean.trimEnd()}…`;
};

/** Cabecera de página común a todas las hojas. */
const drawPageHeader = (doc: jsPDF, className: string, periodName: string): void => {
    doc.setFillColor(...BLUE);
    doc.rect(0, 0, PAGE_W, 11, 'F');
    doc.setTextColor(...WHITE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('CUADERNO DOCENTE · BOLETÍN DE CALIFICACIONES', MARGIN_X, 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`${className} · ${periodName}`, PAGE_W - MARGIN_X, 7, { align: 'right' });
    doc.setTextColor(...DARK);
};

/** Ficha del alumno: nombre, medidas y nota de la evaluación. */
const drawStudentHeader = (
    doc: jsPDF,
    studentName: string,
    acneae: string[],
    grade: number | null,
    index: number,
    total: number,
): number => {
    let y = 23;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(...DARK);
    doc.text(studentName, MARGIN_X, y);

    // Recuadro de nota
    const boxW = 30;
    const boxH = 16;
    const boxX = PAGE_W - MARGIN_X - boxW;
    const boxY = y - 10;
    doc.setFillColor(...LIGHT);
    doc.roundedRect(boxX, boxY, boxW, boxH, 2, 2, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...SLATE);
    doc.text('NOTA DE LA EVALUACIÓN', boxX + boxW / 2, boxY + 5, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...DARK);
    doc.text(grade === null ? '—' : fmt(grade), boxX + boxW / 2, boxY + 13, { align: 'center' });

    y += 5;

    const meta = [`Fecha de emisión: ${today()}`, `Alumno/a ${index} de ${total}`];
    if (acneae.length > 0) meta.push(`Medidas: ${sortAcneaeTags(acneae).join(' > ')}`);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...SLATE);
    doc.text(meta.join('   ·   '), MARGIN_X, y);

    y += 3;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(MARGIN_X, y, PAGE_W - MARGIN_X, y);

    return y + 6;
};

const sectionTitle = (doc: jsPDF, text: string, y: number): number => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...BLUE);
    doc.text(text.toUpperCase(), MARGIN_X, y);
    doc.setTextColor(...DARK);
    return y + 2;
};

const tableStyles = {
    font: 'helvetica',
    fontSize: 7.5,
    cellPadding: 1.6,
    textColor: DARK,
    lineColor: [226, 232, 240] as [number, number, number],
    lineWidth: 0.1,
    overflow: 'linebreak' as const,
};

const headStyles = {
    fillColor: LIGHT,
    textColor: DARK,
    fontStyle: 'bold' as const,
    fontSize: 7.5,
};

const emptyNote = (doc: jsPDF, text: string, y: number): number => {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(...SLATE);
    doc.text(text, MARGIN_X, y + 3);
    doc.setTextColor(...DARK);
    return y + 7;
};


/** Reparte una lista de filas de tres celdas en dos bloques laterales (lectura por columnas). */
const twoColumnRows = (rows: [string, string, { content: string; halign: 'center' }][]): any[] => {
    const half = Math.ceil(rows.length / 2);
    const out: any[] = [];
    for (let i = 0; i < half; i++) {
        const left = rows[i];
        const right = rows[i + half] ?? ['', '', ''];
        out.push([...left, ...right]);
    }
    return out;
};

const TWO_COLUMN_HEAD = [['Código', 'Criterio', 'Nota', 'Código', 'Criterio', 'Nota']];
const TWO_COLUMN_STYLES = { 0: { cellWidth: 11 }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 9 }, 3: { cellWidth: 11, lineWidth: { left: 0.6 } }, 4: { cellWidth: 'auto' }, 5: { cellWidth: 9 } };

/** Construye el PDF completo de una clase y una evaluación. */
export function buildClassBulletinsPdf(
    classData: ClassData,
    periodId: string,
    data: BulletinData,
): jsPDF {
    const { courses, keyCompetences, specificCompetences, evaluationCriteria, academicConfiguration } = data;
    const period: EvaluationPeriod | undefined =
        academicConfiguration.evaluationPeriods.find(p => p.id === periodId);

    // Si el periodo no existe, se usa como texto el propio id (defensivo).
    const periodName = period?.name ?? periodId;
    const course = courses.find(c => c.id === classData.courseId);
    // Orden natural por código (1.1, 1.2, 2.1…), no el orden de inserción del currículo.
    const classCriteria = evaluationCriteria
        .filter(c => c.courseId === course?.id)
        .sort((a, b) => a.code.localeCompare(b.code, 'es', { numeric: true }));
    const classCompetences = specificCompetences
        .filter(sc => classCriteria.some(c => c.competenceId === sc.id))
        .sort((a, b) => a.code.localeCompare(b.code, 'es', { numeric: true }));

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const total = classData.students.length;
    const pageRanges: { start: number; end: number; name: string }[] = [];

    classData.students.forEach((student, idx) => {
        if (idx > 0) doc.addPage();
        const startPage = doc.getNumberOfPages();
        drawPageHeader(doc, classData.name, periodName);

        const gradeInfo = calculateEvaluationPeriodGradeForStudent(
            student.id,
            classData,
            periodId,
            academicConfiguration.gradeScale,
            academicConfiguration.passingGrade,
            academicConfiguration,
            classCriteria,
            classCompetences,
        );
        const grade = gradeInfo.grade !== null && gradeInfo.grade !== undefined
            ? Number(gradeInfo.grade)
            : null;
        /** Nueva página de continuación del mismo alumno, con cabecera identificativa. */
        const continuation = (): number => {
            doc.addPage();
            drawPageHeader(doc, classData.name, periodName);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(...DARK);
            doc.text(student.name, MARGIN_X, 18);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
            doc.setTextColor(...SLATE);
            doc.text(`${periodName} · continuación`, PAGE_W - MARGIN_X, 18, { align: 'right' });
            doc.setTextColor(...DARK);
            return 24;
        };

        let y = drawStudentHeader(
            doc,
            student.name,
            student.acneae || [],
            Number.isNaN(grade as number) ? null : grade,
            idx + 1,
            total,
        );

        // 1. Desglose de la calificación
        y = sectionTitle(doc, 'Calificaciones de la evaluación', y);
        const breakdown = calculateDetailedPeriodGradeBreakdown(student.id, classData, periodId);
        const body: any[] = [];

        breakdown.categories.forEach(cat => {
            body.push([
                { content: cat.name, styles: { fontStyle: 'bold', fillColor: LIGHT } },
                { content: `${cat.weight}%`, styles: { fontStyle: 'bold', fillColor: LIGHT, halign: 'center' } },
                { content: cat.average === null ? '—' : fmt(cat.average), styles: { fontStyle: 'bold', fillColor: LIGHT, halign: 'center' } },
            ]);
            if (cat.assignments.length === 0) {
                body.push([{ content: '   Sin actividades calificadas', styles: { textColor: SLATE, fontStyle: 'italic' } }, '', '']);
            } else {
                cat.assignments.forEach(a => {
                    body.push([`   ${a.name}`, '', { content: a.score === null ? '—' : fmt(a.score), halign: 'center' }]);
                });
            }
        });

        if (body.length === 0) {
            y = emptyNote(doc, 'No hay categorías de calificación en esta evaluación.', y);
        } else {
            autoTable(doc, {
                startY: y,
                margin: { left: MARGIN_X, right: MARGIN_X, bottom: 18, top: 16 },
                head: [['Categoría / actividad', 'Peso', 'Nota']],
                body,
                theme: 'grid',
                styles: tableStyles,
                headStyles,
                columnStyles: { 0: { cellWidth: 'auto' }, 1: { cellWidth: 18 }, 2: { cellWidth: 18 } },
                didDrawPage: () => { /* el pie se añade al final */ },
            });
            y = ((doc as any).lastAutoTable?.finalY ?? y) + 5;
        }

        // Fórmula aplicada (transparencia del cálculo)
        const catsWithAvg = breakdown.categories.filter(c => c.average !== null);
        if (catsWithAvg.length > 0) {
            const terms = catsWithAvg.map(c => `(${fmt(c.average)} × ${c.weight})`).join(' + ');
            const totalWeight = catsWithAvg.reduce((sum, c) => sum + c.weight, 0);
            doc.setFillColor(239, 246, 255);
            const formulaText = `Nota = [${terms}] / ${totalWeight}  =  ${fmt(breakdown.finalGrade)}`;
            const lines = doc.splitTextToSize(formulaText, CONTENT_W - 6);
            const boxH = 4 + lines.length * 3.6;
            if (y + boxH > PAGE_H - 20) { y = continuation(); }
            doc.roundedRect(MARGIN_X, y, CONTENT_W, boxH, 1.5, 1.5, 'F');
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.5);
            doc.setTextColor(...DARK);
            doc.text(lines, MARGIN_X + 3, y + 4.5);
            y += boxH + 2;
            doc.setFontSize(6.5);
            doc.setTextColor(...SLATE);
            doc.text('Las categorías sin actividades calificadas no computan en la media ponderada.', MARGIN_X, y + 2);
            y += 9;
            doc.setTextColor(...DARK);
        }

        // 2. Criterios de evaluación
        if (y > PAGE_H - 45) { y = continuation(); }
        y = sectionTitle(doc, 'Criterios de evaluación', y);
        if (classCriteria.length === 0) {
            y = emptyNote(doc, 'No hay criterios de evaluación configurados para este curso.', y);
        } else {
            const cg = calculateStudentCriterionGrades(
                student.id, classData, classCriteria, academicConfiguration, periodId,
            );
            const rows = classCriteria.map(c => [
                c.code,
                truncate(c.description, 150),
                { content: fmt(cg.get(c.id) ?? null), halign: 'center' as const },
            ] as [string, string, { content: string; halign: 'center' }]);
            autoTable(doc, {
                startY: y,
                margin: { left: MARGIN_X, right: MARGIN_X, bottom: 18, top: 16 },
                head: TWO_COLUMN_HEAD,
                body: twoColumnRows(rows),
                theme: 'grid',
                styles: { ...tableStyles, fontSize: 6.3, cellPadding: 1.2 },
                headStyles: { ...headStyles, fontSize: 6.5 },
                columnStyles: TWO_COLUMN_STYLES as any,
            });
            y = ((doc as any).lastAutoTable?.finalY ?? y) + 5;
        }

        // 3. Competencias específicas
        if (y > PAGE_H - 45) { y = continuation(); }
        y = sectionTitle(doc, 'Competencias específicas', y);
        if (classCompetences.length === 0) {
            y = emptyNote(doc, 'No hay competencias específicas configuradas para este curso.', y);
        } else {
            const sg = calculateStudentCompetenceGrades(
                student.id, classData, classCriteria, classCompetences, academicConfiguration, periodId,
            );
            const rows = classCompetences.map(sc => [
                sc.code,
                truncate(sc.description, 150),
                { content: fmt(sg.get(sc.id) ?? null), halign: 'center' as const },
            ] as [string, string, { content: string; halign: 'center' }]);
            autoTable(doc, {
                startY: y,
                margin: { left: MARGIN_X, right: MARGIN_X, bottom: 18, top: 16 },
                head: TWO_COLUMN_HEAD,
                body: twoColumnRows(rows),
                theme: 'grid',
                styles: { ...tableStyles, fontSize: 6.3, cellPadding: 1.2 },
                headStyles: { ...headStyles, fontSize: 6.5 },
                columnStyles: TWO_COLUMN_STYLES as any,
            });
            y = ((doc as any).lastAutoTable?.finalY ?? y) + 5;
        }

        // 4. Competencias clave
        if (y > PAGE_H - 30) { y = continuation(); }
        y = sectionTitle(doc, 'Competencias clave', y);
        if (keyCompetences.length === 0) {
            y = emptyNote(doc, 'No hay competencias clave configuradas.', y);
        } else {
            const kg = calculateStudentKeyCompetenceGrades(
                student.id, classData, classCriteria, classCompetences, keyCompetences,
                academicConfiguration, periodId,
            );
            // Resumen compacto (sigla y nota): en tabla ocupaba una hoja entera para 8 filas.
            const resumen = keyCompetences
                .map(kc => `${kc.code} ${fmt(kg.get(kc.id) ?? null)}`)
                .join('   ·   ');
            const lines = doc.splitTextToSize(resumen, CONTENT_W - 6);
            const boxH = 5 + lines.length * 3.6;
            if (y + boxH > PAGE_H - 18) { y = continuation(); }
            doc.setFillColor(...LIGHT);
            doc.roundedRect(MARGIN_X, y, CONTENT_W, boxH, 1.5, 1.5, 'F');
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.2);
            doc.setTextColor(...DARK);
            doc.text(lines, MARGIN_X + 3, y + 4.5);
            y += boxH + 1;
            doc.setFontSize(6.2);
            doc.setTextColor(...SLATE);
            doc.text('Siglas y nota media de cada competencia clave en esta evaluación.', MARGIN_X, y + 2.5);
        }

        pageRanges.push({ start: startPage, end: doc.getNumberOfPages(), name: student.name });
    });

    // Pie de página en todas las hojas
    const pages = doc.getNumberOfPages();
    for (let p = 1; p <= pages; p++) {
        doc.setPage(p);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(MARGIN_X, PAGE_H - 12, PAGE_W - MARGIN_X, PAGE_H - 12);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(...SLATE);
        const range = pageRanges.find(r => p >= r.start && p <= r.end);
        doc.text(
            `${range ? range.name + ' · ' : ''}${classData.name} · ${periodName}`,
            MARGIN_X, PAGE_H - 8,
        );
        if (range) {
            const sheetCount = range.end - range.start + 1;
            doc.text(`hoja ${p - range.start + 1} de ${sheetCount}`, PAGE_W - MARGIN_X, PAGE_H - 8, { align: 'right' });
        }
    }

    return doc;
}
