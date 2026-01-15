import React from 'react';
import Modal from './Modal';
import { ClipboardDocumentIcon } from './Icons';

interface ProgrammingGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  isLoading: boolean;
  unitName: string;
}

const ProgrammingGenerationModal: React.FC<ProgrammingGenerationModalProps> = ({ isOpen, onClose, content, isLoading, unitName }) => {

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    alert("Contenido copiado al portapapeles.");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Propuesta de IA para: ${unitName}`} size="3xl">
      <div className="space-y-4">
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-md max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
              <div className="loader"></div>
              <p className="mt-4 text-slate-600">Generando la unidad didáctica... Esto puede tardar un momento.</p>
            </div>
          ) : (
            <div className="text-slate-800 whitespace-pre-wrap">
                {content}
            </div>
          )}
        </div>
         <div className="flex justify-end pt-2 space-x-2">
            <button
                type="button"
                onClick={handleCopy}
                disabled={isLoading || !content}
                className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:bg-slate-300"
            >
                <ClipboardDocumentIcon className="w-4 h-4 mr-2" />
                Copiar Texto
            </button>
            <button
                onClick={onClose}
                className="inline-flex justify-center py-2 px-4 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                Cerrar
            </button>
        </div>
      </div>
    </Modal>
  );
};

export default ProgrammingGenerationModal;