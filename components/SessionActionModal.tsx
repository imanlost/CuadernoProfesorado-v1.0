
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { CalendarEvent } from './CalendarView'; 
import { BookOpenIcon } from './Icons';

interface SessionActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancelSession: (classId: string, date: Date) => void;
  onUpdateSession: (unitId: string, sessionNumber: number, description: string) => void;
  onInsertAndDisplaceSession: (unitId: string, sessionNumber: number, description: string) => void;
  event: CalendarEvent | null;
}

const SessionActionModal: React.FC<SessionActionModalProps> = ({ isOpen, onClose, onCancelSession, onUpdateSession, onInsertAndDisplaceSession, event }) => {
    const [journalNote, setJournalNote] = useState('');

    useEffect(() => {
        if (event) {
            // Load the journal note if exists, otherwise empty (to encourage "real" logging)
            setJournalNote(event.journalNote || '');
        }
    }, [event]);

    if (!event) return null;

    const handleSaveJournalNote = () => {
        if (event?.unitId && event?.sessionNumber) {
            onUpdateSession(event.unitId, event.sessionNumber, journalNote);
            onClose();
        }
    };
    
    // NOTE: This functionality currently updates the Journal Entry due to the change in CalendarView logic, 
    // effectively making "Displace" behave oddly if we keep it linked to Journal. 
    // For now, we will disable "Guardar y Desplazar" in this context or treat it as a "Plan Change"
    // But per user request, we focus on Journal bidirectional sync. 
    // The "Update Session" callback was re-routed to create a Journal Entry.
    
    // To keep it simple and consistent with the new requirement:
    // We remove "Desplazar" from this modal because we are editing the DIARIO (Journal), not the PLAN (ProgrammingUnit).
    // Modifying the Plan structure (displacing sessions) should be done in the Planner.

    const handleCancelClick = () => {
        if (window.confirm(`¿Seguro que quieres cancelar esta sesión?\n\n- Clase: ${event.className}\n- Fecha: ${event.date.toLocaleDateString()}\n\nTodas las sesiones posteriores para esta clase se reorganizarán para ocupar este hueco.`)) {
            onCancelSession(event.classId, event.date);
            onClose();
        }
    };
    
    const title = `Diario de Clase: ${event.date.toLocaleDateString()}`;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
            <div className="space-y-6">
                <div>
                    <h3 className="text-xl font-bold text-slate-800">{event.className}</h3>
                    <p className="text-slate-600 font-medium">{event.unitName} <span className="text-slate-400 font-normal">(Sesión {event.sessionNumber}/{event.totalSessions})</span></p>
                </div>

                {/* Read-Only Planned Content */}
                <div className="p-4 bg-indigo-50 border-b-2 border-indigo-100 rounded-t-lg -mx-6 -mt-2">
                    <div className="flex items-center gap-2 text-indigo-800 font-semibold text-xs uppercase tracking-wide mb-2">
                        <BookOpenIcon className="w-4 h-4" />
                        Lo Programado:
                    </div>
                    {event.description ? (
                        <p className="text-slate-800 text-sm leading-relaxed">{event.description}</p>
                    ) : (
                        <p className="text-slate-400 text-sm italic">Sin contenido planificado detallado.</p>
                    )}
                </div>

                {/* Editable Journal Entry */}
                <div className="space-y-2">
                    <label htmlFor="journal-note-edit" className="block text-sm font-medium text-slate-700">Anotaciones del Diario (Lo Realizado)</label>
                    <textarea
                        id="journal-note-edit"
                        value={journalNote}
                        onChange={(e) => setJournalNote(e.target.value)}
                        className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[150px] text-sm"
                        placeholder="Escribe aquí lo que realmente se hizo en clase, incidencias, tareas, etc..."
                    />
                    <div className="flex justify-end">
                        <button onClick={handleSaveJournalNote} className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 shadow-sm transition-colors">
                            Guardar en el Diario
                        </button>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <button
                        onClick={handleCancelClick}
                        className="w-full text-center text-red-600 font-medium py-2 px-4 hover:bg-red-50 rounded-lg transition-colors text-sm"
                    >
                        Anular Sesión (Día No Lectivo)
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default SessionActionModal;
