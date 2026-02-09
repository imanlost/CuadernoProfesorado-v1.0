
import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import { TrashIcon } from './Icons';
import { ACNEAE_TAGS } from '../constants';

interface TempStudent {
    id: number;
    name: string;
    acneae: Set<string>;
}

interface BulkAddStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (students: { name: string; acneae: string[] }[]) => void;
}

const AcneaeSelector: React.FC<{ selected: Set<string>; onChange: (newSelection: Set<string>) => void }> = ({ selected, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleTagChange = (tag: string, checked: boolean) => {
        const newSelection = new Set(selected);
        if (checked) {
            newSelection.add(tag);
        } else {
            newSelection.delete(tag);
        }
        onChange(newSelection);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="px-3 py-1.5 border border-slate-300 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
                ACNEAE ({selected.size})
            </button>
            {isOpen && (
                <div className="absolute z-10 mt-1 w-64 bg-white shadow-lg border rounded-md p-2 right-0">
                    <p className="text-xs font-bold mb-2">Seleccionar Medidas</p>
                    <div className="grid grid-cols-2 gap-2">
                        {ACNEAE_TAGS.map(tag => (
                            <label key={tag} className="flex items-center space-x-2 text-xs cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selected.has(tag)}
                                    onChange={e => handleTagChange(tag, e.target.checked)}
                                    className="rounded text-blue-600 focus:ring-blue-500"
                                />
                                <span>{tag}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


const BulkAddStudentModal: React.FC<BulkAddStudentModalProps> = ({ isOpen, onClose, onSave }) => {
    const [students, setStudents] = useState<TempStudent[]>([]);

    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const text = e.clipboardData.getData('text');
        e.preventDefault();
        const names = text.split('\n').map(name => name.trim()).filter(name => name.length > 0);
        const newStudents: TempStudent[] = names.map((name, index) => ({
            id: Date.now() + index,
            name: name,
            acneae: new Set<string>(),
        }));
        setStudents(current => [...current, ...newStudents]);
    };

    const handleNameChange = (id: number, newName: string) => {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, name: newName } : s));
    };

    const handleAcneaeChange = (id: number, newAcneae: Set<string>) => {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, acneae: newAcneae } : s));
    };

    const removeStudent = (id: number) => {
        setStudents(prev => prev.filter(s => s.id !== id));
    };

    const handleSave = () => {
        const studentsToSave = students
            .filter(s => s.name.trim() !== '')
            .map(s => ({
                name: s.name.trim(),
                acneae: Array.from(s.acneae)
            }));
        
        if(studentsToSave.length > 0) {
            onSave(studentsToSave);
        }
        handleClose();
    };

    const handleClose = () => {
        setStudents([]);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Añadir Alumnado en Lote" size="2xl">
            <div className="space-y-4">
                <div>
                    <label htmlFor="student-paste-area" className="block text-sm font-medium text-slate-700">
                        Pega aquí el listado de alumnado
                    </label>
                    <textarea
                        id="student-paste-area"
                        onPaste={handlePaste}
                        placeholder="Copia y pega una lista de nombres aquí, uno por línea."
                        className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm min-h-[100px]"
                    />
                </div>

                {students.length > 0 && (
                    <div>
                        <h4 className="text-sm font-medium text-slate-700 mb-2">Alumnado a añadir:</h4>
                        <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-2 bg-slate-50">
                            {students.map((student, index) => (
                                <div key={student.id} className="flex items-center gap-2 p-1 bg-white rounded-md border">
                                    <span className="font-semibold text-slate-500 w-6 text-center">{index + 1}.</span>
                                    <input
                                        type="text"
                                        value={student.name}
                                        onChange={e => handleNameChange(student.id, e.target.value)}
                                        className="flex-grow p-1.5 border border-slate-300 rounded-md sm:text-sm"
                                    />
                                    <AcneaeSelector
                                        selected={student.acneae}
                                        onChange={newTags => handleAcneaeChange(student.id, newTags)}
                                    />
                                    <button onClick={() => removeStudent(student.id)} className="p-2 text-slate-400 hover:text-red-500 rounded-full">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-end pt-4 space-x-2 border-t mt-4">
                    <button type="button" onClick={handleClose} className="bg-white py-2 px-4 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={students.length === 0}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                    >
                        Añadir {students.length > 0 ? `${students.length} ` : ''}Alumn@s
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default BulkAddStudentModal;
