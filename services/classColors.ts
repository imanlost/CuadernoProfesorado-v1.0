// Colores de las clases (materias) en el calendario y en el horario descargable.
//
// Prioridad de color:
//   1. Color manual de la clase (ClassData.color, hex) si está definido.
//   2. Color automático por gama de nivel educativo (1º ESO azul, 2º ESO naranja,
//      3º ESO verde, 4º ESO violeta, 1º Bachillerato amarillo, 2º Bachillerato rojo),
//      con matices escalonados DENTRO de la gama para distinguir los grupos de un
//      mismo nivel (3ºA, 3ºB, 3ºC... no comparten matiz exacto).
//   3. Ocupaciones (guardias, reuniones...) en gris.
//
// Los matices de la gama se reparten por orden alfabético del nombre de clase dentro
// de cada nivel: la asignación es estable entre sesiones y no se repite hasta agotar
// los matices disponibles (8 por nivel).

import type { ClassData, Course } from '../types';

export interface ClassColor {
    backgroundColor: string;
    textColor: string;
    borderColor: string;
}

export const OTHER_OCCUPATION_COLOR: ClassColor = {
    backgroundColor: '#f1f5f9',
    textColor: '#475569',
    borderColor: '#cbd5e1',
};

interface LevelGamut {
    label: string;
    test: RegExp;
    hues: number[];
}

const LEVEL_GAMUTS: LevelGamut[] = [
    // Matices intercalados de la gama (máxima separación entre grupos vecinos);
    // además, makePastel alterna claro/medio por índice para diferenciar aún más.
    { label: '1º ESO', test: /1º\s*ESO/i, hues: [217, 185, 250, 201, 233, 193, 242, 209] },    // azules
    { label: '2º ESO', test: /2º\s*ESO/i, hues: [32, 5, 60, 20, 48, 12, 52, 27] },             // naranjas/ámbar
    { label: '3º ESO', test: /3º\s*ESO/i, hues: [140, 95, 180, 118, 163, 106, 172, 131] },    // verdes
    { label: '4º ESO', test: /4º\s*ESO/i, hues: [275, 235, 315, 255, 295, 245, 305, 265] },   // violetas
    { label: '1º Bachillerato', test: /1º\s*Bach/i, hues: [60, 35, 85, 48, 73, 42, 79, 54] }, // amarillos
    { label: '2º Bachillerato', test: /2º\s*Bach/i, hues: [0, 335, 25, 347, 12, 341, 18, 353] } // rojos
];

const DEFAULT_GAMUT_HUES = [210, 140, 250, 185, 230, 160, 275, 315];

/** Texto blanco o negro según el contraste del color de fondo (hex). */
export const getContrastingTextColor = (hexcolor: string): string => {
    if (!hexcolor) return '#000000';
    let hex = hexcolor;
    if (hex.startsWith('#')) {
        hex = hex.slice(1);
    }
    if (hex.length === 3) {
        hex = hex.split('').map((char: string) => char + char).join('');
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#FFFFFF';
};

const normalizeHex = (hex: string): string => {
    let h = hex.trim();
    if (!h.startsWith('#')) h = `#${h}`;
    if (/^#[0-9a-fA-F]{3}$/.test(h)) {
        h = `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`;
    }
    return h;
};

const shadeHex = (hex: string, percent: number): string => {
    const h = normalizeHex(hex);
    if (!/^#[0-9a-fA-F]{6}$/.test(h)) return h;
    const num = parseInt(h.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const r = Math.min(255, Math.max(0, (num >> 16) + amt));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

const manualColor = (hex: string): ClassColor => ({
    backgroundColor: normalizeHex(hex),
    textColor: getContrastingTextColor(normalizeHex(hex)),
    borderColor: shadeHex(normalizeHex(hex), -28),
});

/**
 * Colores pastel de la gama. variant 0 = claro (light 85), variant 1 = medio
 * (light 74 y algo más saturado): dos clases vecinas del mismo nivel difieren
 * por matiz y por luminosidad, así se distinguen mucho mejor en el horario.
 */
const makePastel = (hue: number, variant: number): ClassColor => {
    if (variant % 2 === 1) {
        const saturation = 72;
        const lightness = 74;
        return {
            backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
            textColor: `hsl(${hue}, 55%, 22%)`,
            borderColor: `hsl(${hue}, ${saturation - 8}%, ${lightness - 16}%)`,
        };
    }
    const saturation = 68;
    const lightness = 85;
    return {
        backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
        textColor: `hsl(${hue}, 55%, 28%)`,
        borderColor: `hsl(${hue}, ${saturation - 10}%, ${lightness - 14}%)`,
    };
};

/**
 * Construye el mapa de colores claseId -> ClassColor para todas las clases.
 * Mismo criterio en el calendario y en el horario descargable para que coincidan.
 */
export const buildClassColorMap = (classes: ClassData[], courses: Course[]): Map<string, ClassColor> => {
    const colorMap = new Map<string, ClassColor>();
    const academicByLevel = new Map<string, ClassData[]>();

    classes.forEach(c => {
        const course = courses.find(co => co.id === c.courseId);
        if (!course) {
            colorMap.set(c.id, OTHER_OCCUPATION_COLOR);
            return;
        }
        if (course.type === 'other') {
            colorMap.set(c.id, OTHER_OCCUPATION_COLOR);
            return;
        }
        if (c.color) {
            colorMap.set(c.id, manualColor(c.color));
            return;
        }
        const list = academicByLevel.get(course.level) || [];
        list.push(c);
        academicByLevel.set(course.level, list);
    });

    academicByLevel.forEach((classList, level) => {
        const gamut = LEVEL_GAMUTS.find(g => g.test.test(level)) || { hues: DEFAULT_GAMUT_HUES };
        const sorted = [...classList].sort((a, b) => a.name.localeCompare(b.name, 'es'));
        sorted.forEach((c, index) => {
            const hue = gamut.hues[index % gamut.hues.length];
            colorMap.set(c.id, makePastel(hue, index % 2));
        });
    });

    return colorMap;
};
