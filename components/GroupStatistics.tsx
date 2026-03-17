
import React, { useMemo } from 'react';
import type { ClassData, ProgrammingUnit, AcademicConfiguration, Course } from '../types';
import { calculateEvaluationPeriodGradeForStudent, calculateOverallFinalGradeForStudent } from '../services/gradeCalculations';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartBarIcon, BookOpenIcon, UserGroupIcon } from './Icons';

interface GroupStatisticsProps {
  classData: ClassData;
  programmingUnits: ProgrammingUnit[];
  academicConfiguration: AcademicConfiguration;
  allCourses: Course[];
}

const GroupStatistics: React.FC<GroupStatisticsProps> = ({ classData, programmingUnits, academicConfiguration, allCourses }) => {
  const { evaluationPeriods } = academicConfiguration;
  const course = allCourses.find(c => c.id === classData.courseId);

  // 1. Units Statistics
  const unitsStats = useMemo(() => {
    const courseUnits = programmingUnits.filter(u => u.courseId === classData.courseId);
    const totalUnits = courseUnits.length;
    const taughtUnits = courseUnits.filter(u => u.isTaught).length;
    const percentage = totalUnits > 0 ? (taughtUnits / totalUnits) * 100 : 0;

    return {
      total: totalUnits,
      taught: taughtUnits,
      percentage: percentage.toFixed(1),
      pending: totalUnits - taughtUnits
    };
  }, [programmingUnits, classData.courseId]);

  // 2. Grade Statistics (Current Period or Final)
  const gradeStats = useMemo(() => {
    const statsByPeriod = new Map<string, { pass: number; fail: number; total: number; distribution: number[] }>();

    evaluationPeriods.forEach(period => {
      let pass = 0;
      let fail = 0;
      const distribution = new Array(11).fill(0); // 0 to 10

      classData.students.forEach(student => {
        const result = calculateEvaluationPeriodGradeForStudent(student.id, classData, period.id, academicConfiguration.gradeScale, academicConfiguration.passingGrade);
        if (result.grade !== null) {
          if (result.grade >= (academicConfiguration.passingGrade ?? 5)) pass++;
          else fail++;
          
          const bucket = Math.min(10, Math.max(0, Math.floor(result.grade)));
          distribution[bucket]++;
        }
      });

      const total = pass + fail;
      statsByPeriod.set(period.id, { pass, fail, total, distribution });
    });

    // Final Grades
    let finalPass = 0;
    let finalFail = 0;
    const finalDistribution = new Array(11).fill(0);
    classData.students.forEach(student => {
      const result = calculateOverallFinalGradeForStudent(student.id, classData, academicConfiguration);
      if (result.grade !== 'N/A') {
        const gradeNum = parseFloat(result.grade);
        if (gradeNum >= (academicConfiguration.passingGrade ?? 5)) finalPass++;
        else finalFail++;
        
        const bucket = Math.min(10, Math.max(0, Math.floor(gradeNum)));
        finalDistribution[bucket]++;
      }
    });
    const finalTotal = finalPass + finalFail;
    statsByPeriod.set('final', { pass: finalPass, fail: finalFail, total: finalTotal, distribution: finalDistribution });

    return statsByPeriod;
  }, [classData, evaluationPeriods, academicConfiguration]);

  const activeStats = gradeStats.get('final') || { pass: 0, fail: 0, total: 0, distribution: [] };
  
  const pieData = [
    { name: 'Aprobados', value: activeStats.pass, color: '#10b981' },
    { name: 'Suspensos', value: activeStats.fail, color: '#ef4444' },
  ];

  const barData = activeStats.distribution.map((count, i) => ({
    grade: i.toString(),
    count
  }));

  return (
    <div className="space-y-6 p-6 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Estadísticas de Rendimiento</h1>
          <p className="text-slate-500">{classData.name} • {course?.name || 'Curso no definido'}</p>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 flex items-center gap-3">
            <ChartBarIcon className="w-8 h-8 text-blue-600" />
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estado General</p>
                <p className="text-lg font-bold text-slate-700">{activeStats.total > 0 ? ((activeStats.pass / activeStats.total) * 100).toFixed(1) : 0}% Aprobados</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Units Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <BookOpenIcon className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="font-bold text-slate-800">Unidades Didácticas</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-3xl font-bold text-slate-800">{unitsStats.taught}</p>
                <p className="text-sm text-slate-500">Impartidas de {unitsStats.total}</p>
              </div>
              <p className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{unitsStats.percentage}%</p>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${unitsStats.percentage}%` }}
              ></div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs font-bold text-slate-400 uppercase">Programadas</p>
                    <p className="text-xl font-bold text-slate-700">{unitsStats.total}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs font-bold text-slate-400 uppercase">Pendientes</p>
                    <p className="text-xl font-bold text-slate-700">{unitsStats.pending}</p>
                </div>
            </div>
          </div>
        </div>

        {/* Pass/Fail Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <UserGroupIcon className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="font-bold text-slate-800">Resultados de Evaluación (Final)</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-6 flex flex-col justify-center">
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div>
                        <p className="text-sm font-bold text-emerald-800">Alumnado Aprobado</p>
                        <p className="text-xs text-emerald-600">Nota ≥ {academicConfiguration.passingGrade ?? 5}</p>
                    </div>
                    <p className="text-3xl font-bold text-emerald-700">{activeStats.pass}</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                    <div>
                        <p className="text-sm font-bold text-red-800">Alumnado Suspenso</p>
                        <p className="text-xs text-red-600">Nota {'<'} {academicConfiguration.passingGrade ?? 5}</p>
                    </div>
                    <p className="text-3xl font-bold text-red-700">{activeStats.fail}</p>
                </div>
            </div>
          </div>
        </div>

        {/* Grade Distribution Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 md:col-span-3">
          <h2 className="font-bold text-slate-800 mb-6">Distribución de Calificaciones</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                    dataKey="grade" 
                    label={{ value: 'Calificación', position: 'insideBottom', offset: -5 }} 
                />
                <YAxis 
                    label={{ value: 'Nº Alumnos', angle: -90, position: 'insideLeft' }} 
                    allowDecimals={false}
                />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Period Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b bg-slate-50">
            <h2 className="font-bold text-slate-800">Resumen por Evaluaciones</h2>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Evaluación</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Total Alumnos</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Aprobados</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Suspensos</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">% Éxito</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {evaluationPeriods.map(period => {
                        const stats = gradeStats.get(period.id);
                        if (!stats || stats.total === 0) return null;
                        const successRate = ((stats.pass / stats.total) * 100).toFixed(1);
                        return (
                            <tr key={period.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{period.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-slate-500">{stats.total}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-emerald-600 font-bold">{stats.pass}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-red-600 font-bold">{stats.fail}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${parseFloat(successRate) >= 50 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                        {successRate}%
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default GroupStatistics;
