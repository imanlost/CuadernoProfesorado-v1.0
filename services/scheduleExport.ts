// Exportación del horario semanal de clases en formatos interoperables:
//   - JSON (esquema v1): pensado para importar en la app Android MiHorario
//     (y compatible con cualquier programa que lea ese esquema).
//   - CSV: filas planas (día, franja, horas, clase, nivel, materia) para hojas
//     de cálculo y programas de timetable que importen CSV.
//
// El archivo JSON lleva la versión de la aplicación en el campo "generador".

import type { AcademicConfiguration, ClassData, Course } from '../types';
import { buildClassColorMap, type ClassColor } from './classColors';

// ---------- Utilidades de color ----------

const hslToHex = (h: number, s: number, l: number): string => {
    const sat = s / 100;
    const lig = l / 100;
    const c = (1 - Math.abs(2 * lig - 1)) * sat;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = lig - c / 2;
    let r = 0; let g = 0; let b = 0;
    if (h < 60) { r = c; g = x; } else if (h < 120) { r = x; g = c; } else if (h < 180) { g = c; b = x; } else if (h < 240) { g = x; b = c; } else if (h < 300) { r = x; b = c; } else { r = c; b = x; }
    const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

const rgbToHex = (rgb: string): string | null => {
    const m = rgb.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (!m) return null;
    const toHex = (v: string) => parseInt(v, 10).toString(16).padStart(2, '0');
    return `#${toHex(m[1])}${toHex(m[2])}${toHex(m[3])}`.toUpperCase();
};

/** Color en formato HEX de una clase (el mismo que pinta el calendario). */
export const classColorToHex = (color: ClassColor | undefined): string | null => {
    if (!color) return null;
    const bg = color.backgroundColor;
    if (bg.startsWith('#')) return bg.toUpperCase();
    if (bg.startsWith('hsl')) {
        const m = bg.match(/hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)/i);
        if (m) return hslToHex(parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]));
    }
    if (bg.startsWith('rgb')) return rgbToHex(bg);
    return null;
};

// ---------- Franjas horarias ----------

interface ParsedPeriod {
    label: string;
    start: string;
    end: string;
}

/** "1ª Hora (8:00-8:55)" -> { label: "1ª Hora", start: "08:00", end: "08:55" } */
const parsePeriodLabel = (raw: string): ParsedPeriod => {
    const m = raw.trim().match(/^(.*?)\s*\(\s*(\d{1,2}):(\d{2})\s*[-–—]\s*(\d{1,2}):(\d{2})\s*\)\s*$/);
    if (m) {
        const pad = (n: string) => n.padStart(2, '0');
        return { label: m[1].trim(), start: `${pad(m[2])}:${m[3]}`, end: `${pad(m[4])}:${m[5]}` };
    }
    return { label: raw.trim(), start: '', end: '' };
};

// ---------- Exportación JSON (esquema v1 MiHorario) ----------

export interface HorarioPeriodJson { index: number; label: string; start: string; end: string; }
export interface HorarioSesionJson { dia: number; periodo: number; aula?: string | null; }
export interface HorarioClaseJson {
    id: string;
    nombre: string;
    grupo?: string | null;
    color?: string | null;
    sesiones: HorarioSesionJson[];
}

export const buildHorarioJson = (
    classes: ClassData[],
    courses: Course[],
    academicConfiguration: AcademicConfiguration,
    appVersion: string,
): string => {
    const periods: HorarioPeriodJson[] = (academicConfiguration.periods || []).map((raw, i) => {
        const p = parsePeriodLabel(raw);
        return { index: i, label: p.label, start: p.start, end: p.end };
    });
    const colorMap = buildClassColorMap(classes, courses);
    const clases: HorarioClaseJson[] = [];
    const actividades: HorarioClaseJson[] = [];

    classes.forEach((c) => {
        const course = courses.find((co) => co.id === c.courseId);
        const esActividad = course?.type === 'other';
        const sesiones = (c.schedule || [])
            .filter((s) => s.day >= 1 && s.day <= 5)
            .map((s) => ({ dia: s.day, periodo: s.periodIndex }));
        if (sesiones.length === 0) return; // sin horario asignado no aporta nada
        const base: HorarioClaseJson = { id: c.id, nombre: c.name, sesiones };
        if (esActividad) {
            actividades.push(base);
        } else {
            const hex = classColorToHex(colorMap.get(c.id));
            if (hex) base.color = hex;
            clases.push(base);
        }
    });

    // curso: "2026-2027" a partir del inicio del curso académico
    let curso = '';
    if (academicConfiguration.academicYearStart) {
        const y = parseInt(academicConfiguration.academicYearStart.slice(0, 4), 10);
        if (!isNaN(y)) curso = `${y}-${y + 1}`;
    }

    const payload = {
        version: 1,
        curso,
        generador: `Cuaderno Docente v${appVersion}`,
        periods,
        clases,
        actividades,
    };
    return JSON.stringify(payload, null, 2);
};

// ---------- Exportación CSV ----------

export const buildHorarioCsv = (
    classes: ClassData[],
    courses: Course[],
    academicConfiguration: AcademicConfiguration,
): string => {
    const periodLabels = academicConfiguration.periods || [];
    const courseById = new Map(courses.map((co) => [co.id, co]));
    const rows: string[] = [];
    const esc = (v: string | number | null | undefined): string => {
        if (v === null || v === undefined) return '';
        const s = String(v);
        return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };

    rows.push('Dia;Periodo;HoraInicio;HoraFin;Clase;Nivel;Materia');
    classes.forEach((c) => {
        const course = courseById.get(c.courseId);
        (c.schedule || [])
            .filter((s) => s.day >= 1 && s.day <= 5)
            .slice()
            .sort((a, b) => a.day - b.day || a.periodIndex - b.periodIndex)
            .forEach((s) => {
                const p = parsePeriodLabel(periodLabels[s.periodIndex] ?? '');
                const dia = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'][s.day] ?? String(s.day);
                rows.push([
                    dia,
                    p.label,
                    p.start,
                    p.end,
                    c.name,
                    course?.level ?? '',
                    course?.subject ?? '',
                ].map(esc).join(';'));
            });
    });

    // Cabecera limpia en la primera línea (los importadores CSV la exigen ahí);
    // el BOM UTF-8 va al principio para que Excel muestre bien las tildes.
    return `\uFEFF${rows.join('\n')}\n`;
};

// ---------- Descarga ----------

const downloadTextFile = (fileName: string, content: string, mime: string): void => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
};

// Nombre de archivo para las exportaciones del horario (ej. "horario_2024-2025.json").
export const horarioExportFileName = (
    academicConfiguration: AcademicConfiguration,
    extension: 'json' | 'csv',
): string => {
    const y = academicConfiguration.academicYearStart ? academicConfiguration.academicYearStart.slice(0, 4) : '';
    return `horario${y ? `_${y}-${parseInt(y, 10) + 1}` : ''}.${extension}`;
};

export const downloadHorarioJson = (
    classes: ClassData[],
    courses: Course[],
    academicConfiguration: AcademicConfiguration,
    appVersion: string,
): void => {
    downloadTextFile(horarioExportFileName(academicConfiguration, 'json'), buildHorarioJson(classes, courses, academicConfiguration, appVersion), 'application/json');
};

export const downloadHorarioCsv = (
    classes: ClassData[],
    courses: Course[],
    academicConfiguration: AcademicConfiguration,
): void => {
    downloadTextFile(horarioExportFileName(academicConfiguration, 'csv'), buildHorarioCsv(classes, courses, academicConfiguration), 'text/csv;charset=utf-8');
};
