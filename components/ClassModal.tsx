import React, { useState, useEffect } from 'react';
import type { ClassData, Course } from '../types';
import Modal from './Modal';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (classData: Omit<ClassData, 'students' | 'categories' | 'assignments' | 'grades'>) => void;
  classToEdit: ClassData | null;
  courses: Course[];
}

const ClassModal: React.FC<ClassModalProps> = ({ isOpen, onClose, onSave, classToEdit, courses }) => {
  const [name, setName] = useState('');
  const [courseId, setCourseId] = useState<string>(courses[0]?.id || '');
  const [color, setColor] = useState(''); // '' = automático (gama por nivel)

  useEffect(() => {
    if (isOpen) {
        if (classToEdit) {
            setName(classToEdit.name);
            setCourseId(classToEdit.courseId);
            setColor(classToEdit.color || '');
        } else {
            setName('');
            setCourseId(courses[0]?.id || '');
            setColor('');
        }
    }
  }, [classToEdit, isOpen, courses]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && courseId) {
      onSave({
        id: classToEdit ? classToEdit.id : `class-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name,
        courseId,
        color: color.trim() || undefined,
      });
      onClose();
    } else {
        alert("Por favor, introduce un nombre y selecciona un curso.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={classToEdit ? 'Editar Clase' : 'Nueva Clase'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nombre de la Clase</label>
          <input
            type="text" id="name" value={name} onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="course" className="block text-sm font-medium text-slate-700">Curso</label>
          <select
            id="course" value={courseId} onChange={(e) => setCourseId(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          >
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.level} - {course.subject}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Color en el horario y calendario <span className="font-normal text-slate-400">(opcional)</span>
          </label>
          <div className="mt-1 flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg border border-slate-300 flex items-center justify-center"
              style={{ backgroundColor: color || '#e2e8f0' }}
              title={color ? `Color manual: ${color}` : 'Color automático por nivel'}
            >
              {!color && <span className="text-[9px] text-slate-500">Auto</span>}
            </div>
            <input
              type="color"
              value={color || '#4f8ef7'}
              onChange={(e) => setColor(e.target.value)}
              className="h-9 w-12 p-0.5 bg-white border border-slate-300 rounded cursor-pointer"
              title="Elegir color manual"
            />
            <button
              type="button"
              onClick={() => setColor('')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition ${
                color
                  ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  : 'bg-slate-200 border-slate-200 text-slate-500 cursor-default'
              }`}
            >
              Automático
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Sin color, la aplicación asigna a cada grupo un tono de la gama de su nivel
            (1º ESO azules, 2º ESO naranjas, 3º ESO verdes, 4º ESO violetas, 1º Bach amarillos, 2º Bach rojos).
          </p>
        </div>
        <div className="flex justify-end pt-4 space-x-2 border-t mt-4">
          <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Cancelar
          </button>
          <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            {classToEdit ? 'Guardar Cambios' : 'Crear Clase'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ClassModal;
