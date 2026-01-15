
import React, { useState } from 'react';
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
    const [pastedGrades, setPastedGrades] = useState<string[]>([]);

    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const text = e.clipboardData.getData('text');
        e.preventDefault();
        const grades = text.split(/\r\n|\n/).map(g => g.trim()).filter(g => g);
        setPastedGrades(grades);
    };

    const handleSave = () => {
        const gradesMap = new Map<string, number>();
        students.forEach((student, index) => {
            if (index < pastedGrades.length) {
                const gradeVal = parseFloat(pastedGrades[index].replace(',', '.'));
                if (!isNaN(gradeVal) && gradeVal >= 0 && gradeVal <= 10) {
                    gradesMap.set(student.id, gradeVal);
                }
            }
        });
        onSave(gradesMap);
        onClose();
    };

    const handleClose = () => {
        setPastedGrades([]);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={`Importar Notas para: ${assignment.name}`} size="2xl">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Pega la columna de notas</label>
                    <textarea
                        onPaste={handlePaste}
                        placeholder={`Pega aquí una lista de notas, una por línea. El orden debe coincidir con la lista de alumnos.\n\nEjemplo:\n7.5\n8\n6.25`}
                        className="mt-1 block w-full h-32 p-2 border rounded-md"
                    />
                </div>
                {pastedGrades.length > 0 && (
                    <div>
                        <h4 className="font-semibold mb-2">Previsualización de Importación</h4>
                        <div className="max-h-64 overflow-y-auto border rounded-lg">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 sticky top-0">
                                    <tr>
                                        <th className="p-2 text-left">Alumno</th>
                                        <th className="p-2 text-left">Nota a Importar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student, index) => {
                                        const gradeStr = pastedGrades[index] || '-';
                                        const gradeNum = parseFloat(gradeStr.replace(',', '.'));
                                        const isValid = !isNaN(gradeNum) && gradeNum >= 0 && gradeNum <= 10;
                                        return (
                                            <tr key={student.id} className={`border-t ${!isValid && gradeStr !== '-' ? 'bg-red-50' : ''}`}>
                                                <td className="p-2">{student.name}</td>
                                                <td className={`p-2 font-semibold ${isValid ? 'text-slate-800' : 'text-red-600'}`}>
                                                    {gradeStr}
                                                    {!isValid && gradeStr !== '-' && <span className="ml-2 text-xs">(Inválido)</span>}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                <div className="flex justify-end pt-4 space-x-2 border-t">
                    <button type="button" onClick={handleClose} className="bg-white py-2 px-4 border rounded-lg">Cancelar</button>
                    <button type="button" onClick={handleSave} disabled={pastedGrades.length === 0} className="bg-blue-600 text-white py-2 px-4 rounded-lg disabled:bg-blue-300">
                        Guardar {pastedGrades.filter(g => !isNaN(parseFloat(g.replace(',','.')))).length} Notas
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default BulkGradeImportModal;
