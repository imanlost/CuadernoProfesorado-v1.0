
import React from 'react';
import Modal from './Modal';
import { getGradeColorClass } from '../services/gradeCalculations';
import { GradeScaleRule } from '../types';

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
  gradeScale?: GradeScaleRule[];
}

const DrilldownModal: React.FC<DrilldownModalProps> = ({ isOpen, onClose, data, gradeScale }) => {
  if (!isOpen || !data) return null;

  const finalGradeClass = getGradeColorClass(data.finalGrade, gradeScale);

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
              {data.items.length > 0 ? data.items.map((item, index) => {
                  // Simplified styling for list items (just text color to avoid visual clutter)
                  const itemColorClass = getGradeColorClass(item.grade, gradeScale).split(' ')[1] || 'text-slate-800'; 
                  return (
                    <li key={index} className="p-3 flex justify-between items-center">
                      <span className="text-sm text-slate-600">{item.name}</span>
                      <span className={`text-sm font-bold ${itemColorClass}`}>
                        {item.grade !== null ? item.grade.toFixed(2) : 'S.C.'}
                      </span>
                    </li>
                  )
              }) : (
                <li className="p-3 text-sm text-center text-slate-500 italic">No hay componentes para mostrar.</li>
              )}
            </ul>
          </div>
        </div>
        <div className="pt-4 border-t flex justify-end items-center gap-4">
          <span className="text-md font-semibold text-slate-800">Nota Final:</span>
          <span className={`text-xl font-extrabold px-3 py-1 rounded-md ${finalGradeClass}`}>
            {data.finalGrade !== null ? data.finalGrade.toFixed(2) : 'S.C.'}
          </span>
        </div>
      </div>
    </Modal>
  );
};

export default DrilldownModal;
