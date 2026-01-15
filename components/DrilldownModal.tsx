import React from 'react';
import Modal from './Modal';

// A local, simplified version for styling
const getGradeStyleClasses = (grade: number | null) => {
    if (grade === null || grade === undefined) {
        return 'text-slate-500';
    }
    if (grade < 5) {
        return 'text-red-700 font-bold';
    }
    if (grade < 7) {
        return 'text-yellow-700 font-bold';
    }
    return 'text-green-700 font-bold';
};

export interface DrilldownData {
  studentName: string;
  elementName: string;
  items: {
    name: string;
    grade: number | null;
  }[];
  finalGrade: number | null;
}

interface DrilldownModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: DrilldownData | null;
}

const DrilldownModal: React.FC<DrilldownModalProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Desglose de Calificación`} size="lg">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-slate-500">Alumno</p>
          <p className="font-semibold text-slate-800">{data.studentName}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Elemento Evaluado</p>
          <p className="font-semibold text-slate-800">{data.elementName}</p>
        </div>
        <div className="pt-4 border-t">
          <h4 className="font-semibold text-slate-700 mb-2">Componentes de la Nota:</h4>
          <div className="max-h-60 overflow-y-auto border rounded-lg bg-slate-50/50">
            <ul className="divide-y divide-slate-200">
              {data.items.length > 0 ? data.items.map((item, index) => (
                <li key={index} className="p-3 flex justify-between items-center">
                  <span className="text-sm text-slate-600">{item.name}</span>
                  <span className={`text-sm font-bold ${getGradeStyleClasses(item.grade)}`}>
                    {item.grade !== null ? item.grade.toFixed(2) : 'S.C.'}
                  </span>
                </li>
              )) : (
                <li className="p-3 text-sm text-center text-slate-500 italic">No hay componentes para mostrar.</li>
              )}
            </ul>
          </div>
        </div>
        <div className="pt-4 border-t flex justify-end items-center gap-4">
          <span className="text-md font-semibold text-slate-800">Nota Final:</span>
          <span className={`text-xl font-extrabold px-3 py-1 rounded-md ${getGradeStyleClasses(data.finalGrade)}`}>
            {data.finalGrade !== null ? data.finalGrade.toFixed(2) : 'S.C.'}
          </span>
        </div>
      </div>
    </Modal>
  );
};

export default DrilldownModal;
