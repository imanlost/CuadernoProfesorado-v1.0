
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import type { Student, Assignment } from '../types';

interface BulkGradeImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (grades: Map<string, number>) => void;
    assignment: Assignment;
    students: Student[];
}

const BulkGradeImportModal: React.FC<BulkGradeImportModalProps> = ({ isOpen, onClose, onSave, assignment, students }) => {
    const [bulkText, setBulkText] = useState('');
    // Nota en texto por alumno (editable en la previsualización)
    const [gradesByStudent, setGradesByStudent] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            setBulkText('');
            setGradesByStudent({});
        }
    }, [isOpen]);

    const parseLines = (text: string): string[] =>
        text.split(/\r\n|\n/).map(g => g.trim()).filter(g => g.length > 0);

    const isValidGrade = (raw: string): boolean => {
        const n = parseFloat(raw.replace(',', '.'));
        return !isNaN(n) && n >= 0 && n <= 10;
    };

    // Reparte el bloque (escrito o pegado) por orden de lista
    const assignByOrder = () => {
        const lines = parseLines(bulkText);
        if (lines.length === 0) return;
        const next: Record<string, string> = {};
        students.forEach((student, index) => {
            if (index < lines.length) next[student.id] = lines[index];
        });
        setGradesByStudent(next);
    };

    // Si el pegado trae datos se aplican al momento; si el evento llega vacío
    // (WebKitGTK) se deja pegar de forma nativa en el área de texto.
    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const text = e.clipboardData?.getData('text') ?? '';
        if (!text.trim()) return;
        e.preventDefault();
        setBulkText(text);
        const lines = parseLines(text);
        const next: Record<string, string> = {};
        students.forEach((student, index) => {
            if (index < lines.length) next[student.id] = lines[index];
        });
        setGradesByStudent(next);
    };

    const handleCellChange = (studentId: string, value: string) => {
        setGradesByStudent(prev => ({ ...prev, [studentId]: value }));
    };

    const clearAll = () => {
        setGradesByStudent({});
        setBulkText('');
    };

    const validCount = students.filter(s => {
        const raw = (gradesByStudent[s.id] ?? '').trim();
        return raw !== '' && isValidGrade(raw);
    }).length;

    const handleSave = () => {
        const gradesMap = new Map<string, number>();
        students.forEach(student => {
            const raw = (gradesByStudent[student.id] ?? '').trim();
            if (raw === '') return;
            const n = parseFloat(raw.replace(',', '.'));
            if (!isNaN(n) && n >= 0 && n <= 10) gradesMap.set(student.id, n);
        });
        if (gradesMap.size > 0) onSave(gradesMap);
        handleClose();
    };

    const handleClose = () => {
        setBulkText('');
        setGradesByStudent({});
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={`Importar Notas para: ${assignment.name}`} size="2xl">
            <div className="space-y-4">
                <p className="text-sm text-slate-600">
                    Escribe o pega las notas, una por línea, y pulsa <strong>Asignar por orden</strong>. Después puedes
                    corregir cada nota en la tabla antes de guardar. También puedes escribir la nota directamente en la
                    fila de cada alumno/a.
                </p>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Pega o escribe la columna de notas</label>
                    <textarea
                        value={bulkText}
                        onChange={e => setBulkText(e.target.value)}
                        onPaste={handlePaste}
                        placeholder={'Una nota por línea, en el orden de la lista.\n\nEjemplo:\n7.5\n8\n6.25'}
                        className="mt-1 block w-full h-28 p-2 border border-slate-300 rounded-md text-sm"
                    />
                    <div className="mt-2 flex items-center gap-2">
                        <button
                            type="button"
                            onClick={assignByOrder}
                            disabled={parseLines(bulkText).length === 0}
                            className="inline-flex items-center px-3 py-1.5 border border-blue-600 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Asignar por orden a la lista
                        </button>
                        <button
                            type="button"
                            onClick={clearAll}
                            className="px-3 py-1.5 text-sm text-slate-500 hover:text-red-600"
                        >
                            Limpiar todo
                        </button>
                        {validCount > 0 && (
                            <span className="ml-auto text-xs text-slate-500">{validCount} de {students.length} notas válidas</span>
                        )}
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold mb-2 text-sm">Previsualización (editable)</h4>
                    <div className="max-h-72 overflow-y-auto border rounded-lg">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 sticky top-0">
                                <tr>
                                    <th className="p-2 text-left font-medium">Alumno/a</th>
                                    <th className="p-2 text-left font-medium w-40">Nota</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(student => {
                                    const raw = (gradesByStudent[student.id] ?? '').trim();
                                    const invalid = raw !== '' && !isValidGrade(raw);
                                    return (
                                        <tr key={student.id} className="border-t">
                                            <td className="p-2">{student.name}</td>
                                            <td className="p-2">
                                                <input
                                                    type="text"
                                                    value={gradesByStudent[student.id] ?? ''}
                                                    onChange={e => handleCellChange(student.id, e.target.value)}
                                                    placeholder="—"
                                                    className={`w-full px-2 py-1 border rounded-md text-sm ${
                                                        invalid ? 'border-red-400 bg-red-50' : 'border-slate-300'
                                                    }`}
                                                />
                                                {invalid && <p className="text-xs text-red-600 mt-0.5">Nota inválida (0–10)</p>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="flex justify-end pt-4 space-x-2 border-t">
                    <button type="button" onClick={handleClose} className="bg-white py-2 px-4 border rounded-lg text-sm">Cancelar</button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={validCount === 0}
                        className="bg-blue-600 text-white py-2 px-4 rounded-lg text-sm disabled:bg-blue-300"
                    >
                        Guardar {validCount > 0 ? `${validCount} ` : ''}Notas
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default BulkGradeImportModal;
