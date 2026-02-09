
import React from 'react';
import Modal from './Modal';
import { SparklesIcon } from './Icons';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedback: string;
  isLoading: boolean;
  studentName: string;
  assignmentName: string;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, feedback, isLoading, studentName, assignmentName }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Sugerencia de Feedback para ${studentName}`}>
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Comentario generado por IA para la tarea: <span className="font-semibold">{assignmentName}</span>.
        </p>
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-md min-h-[120px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <SparklesIcon className="w-6 h-6 text-indigo-500 animate-pulse" />
              <span className="ml-2 text-slate-500">Generando feedback...</span>
            </div>
          ) : (
            <p className="text-slate-800 whitespace-pre-wrap">{feedback}</p>
          )}
        </div>
         <div className="flex justify-end pt-2">
          <button
            onClick={() => {
              navigator.clipboard.writeText(feedback);
              onClose();
            }}
            disabled={isLoading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
          >
            Copiar y Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default FeedbackModal;
