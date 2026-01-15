
import React, { useMemo } from 'react';
import type { ClassData, KeyCompetence, Course } from '../types';

interface DescriptorAchievementProps {
  classData: ClassData;
  keyCompetences: KeyCompetence[];
  courses: Course[];
}

const DescriptorAchievement: React.FC<DescriptorAchievementProps> = ({ classData, keyCompetences, courses }) => {

  const usedDescriptorIds = useMemo(() => {
    const descriptorIds = new Set<string>();
    for (const assignment of classData.assignments) {
      for (const linkedCriterion of assignment.linkedCriteria) {
        if (linkedCriterion.selectedDescriptorIds) {
          for (const descriptorId of linkedCriterion.selectedDescriptorIds) {
            descriptorIds.add(descriptorId);
          }
        }
      }
    }
    return descriptorIds;
  }, [classData]);

  const selectedStageSuffix = useMemo(() => {
    const course = courses.find(c => c.id === classData.courseId);
    if (!course) return null;
    // FIX: Use robust regex to correctly identify Bachillerato stage regardless of casing or partial names like "Bach".
    return /bach/i.test(course.level) ? '-bach' : '-eso';
  }, [classData, courses]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800">Cobertura de Descriptores Operativos</h2>
      {keyCompetences.map(kc => {
        const descriptorsToShow = (kc.descriptors || []).filter(d => 
            !selectedStageSuffix || // show all if no course selected (fallback)
            d.id.endsWith(selectedStageSuffix) || // show if matches stage
            // FIX: Use endsWith for consistency and precision
            (!d.id.endsWith('-eso') && !d.id.endsWith('-bach')) // always show generic ones
        );
        
        if (descriptorsToShow.length === 0) return null;

        return (
            <div key={kc.id} className="p-4 border border-slate-200 rounded-lg bg-white">
                <h3 className="text-lg font-semibold text-slate-700 mb-3">{kc.code} - {kc.description}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {descriptorsToShow.map(descriptor => {
                    const isUsed = usedDescriptorIds.has(descriptor.id);
                    return (
                        <div 
                        key={descriptor.id}
                        className={`p-3 rounded-md transition-colors duration-200 ${
                            isUsed ? 'bg-green-100' : 'bg-slate-50'
                        }`}
                        title={isUsed ? 'Este descriptor ha sido trabajado en al menos una tarea.' : 'Este descriptor no ha sido trabajado todavía.'}
                        >
                        <p className="font-bold text-sm text-slate-800">{descriptor.code}</p>
                        <p className="text-xs text-slate-600 mt-1">{descriptor.description}</p>
                        </div>
                    );
                    })}
                </div>
            </div>
        );
      })}
    </div>
  );
};

export default DescriptorAchievement;