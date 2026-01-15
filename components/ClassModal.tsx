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

  useEffect(() => {
    if (isOpen) {
        if (classToEdit) {
            setName(classToEdit.name);
            setCourseId(classToEdit.courseId);
        } else {
            setName('');
            setCourseId(courses[0]?.id || '');
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