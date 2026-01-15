
import type { ClassData, EvaluationCriterion, SpecificCompetence, KeyCompetence, Assignment, Grade, AcademicConfiguration, EvaluationTool, Rubric, RubricItem } from '../types';

export const calculateToolGlobalScore = (
    tool: EvaluationTool,
    toolResults: Record<string, boolean | string>
): number => {
    let totalPoints = 0;
    let maxPoints = 0;

    for (const item of tool.items) {
        const result = toolResults[item.id];
        
        if (tool.type === 'checklist') {
            // Weight represents relative importance. 
            // If result is true, add weight to totalPoints. Max points increases by weight regardless.
            maxPoints += item.weight;
            if (result === true) {
                totalPoints += item.weight;
            }
        } else if (tool.type === 'rating_scale' || tool.type === 'rubric') {
            const levelPoints = tool.levels.map(l => l.points);
            const maxLevelPoints = Math.max(...levelPoints, 0);
            
            // Max possible points for this item is maxLevelPoints * item.weight
            maxPoints += maxLevelPoints * item.weight;

            const levelId = result as string;
            const selectedLevel = tool.levels.find(l => l.id === levelId);
            if (selectedLevel) {
                totalPoints += selectedLevel.points * item.weight;
            }
        }
    }

    if (maxPoints === 0) return 0;
    
    // Normalize to 0-10 scale
    return (totalPoints / maxPoints) * 10;
};

export const calculateCriterionScoresFromTool = (
    tool: EvaluationTool,
    toolResults: Record<string, boolean | string>
): Record<string, number | null> => {
    const criterionTotals: Record<string, { weightedSum: number; totalWeight: number }> = {};

    for (const item of tool.items) {
        const result = toolResults[item.id];
        let itemScore: number | null = null;

        if (tool.type === 'checklist') {
            // Checked = 10, Unchecked = 0
            itemScore = result === true ? 10 : 0;
        } else if (tool.type === 'rating_scale' || tool.type === 'rubric') {
            const levelId = result as string;
            const level = tool.levels.find(l => l.id === levelId);
            if (level) {
                const maxPoints = Math.max(...tool.levels.map(l => l.points), 0);
                if (maxPoints > 0) {
                    itemScore = (level.points / maxPoints) * 10;
                } else {
                    itemScore = 0;
                }
            }
        }

        if (itemScore !== null) {
            for (const criterionId of item.linkedCriteriaIds) {
                if (!criterionTotals[criterionId]) {
                    criterionTotals[criterionId] = { weightedSum: 0, totalWeight: 0 };
                }
                criterionTotals[criterionId].weightedSum += itemScore * item.weight;
                criterionTotals[criterionId].totalWeight += item.weight;
            }
        }
    }

    const finalScores: Record<string, number | null> = {};
    for (const criterionId in criterionTotals) {
        const totals = criterionTotals[criterionId];
        if (totals.totalWeight > 0) {
            finalScores[criterionId] = totals.weightedSum / totals.totalWeight;
        }
    }

    return finalScores;
};


export const calculateAssignmentScoresForStudent = (studentId: string, assignments: Assignment[], grades: Grade[]): Map<string, number | null> => {
    const scores = new Map<string, number | null>();
    const gradesMap = new Map<string, Grade>();
    grades.filter(g => g.studentId === studentId).forEach(grade => {
      gradesMap.set(grade.assignmentId, grade);
    });

    for (const assignment of assignments) {
        const grade = gradesMap.get(assignment.id);
        if (!grade || !grade.criterionScores) {
            scores.set(assignment.id, null);
            continue;
        }

        // For a recovery assignment, its own score is the single grade that was entered.
        // This is primarily for display in the GradebookTable cell.
        if (grade.criterionScores['recovery_grade'] !== undefined && grade.criterionScores['recovery_grade'] !== null) {
            scores.set(assignment.id, grade.criterionScores['recovery_grade']);
            continue;
        }

        // If the assignment uses a tool BUT has explicitly linked criteria (Global Tool Mode),
        // the score is essentially the average of those criteria (which are all the same value = global score).
        // Or simpler: just take one of them.
        if (assignment.evaluationMethod !== 'direct_grade' && assignment.evaluationToolId && assignment.linkedCriteria && assignment.linkedCriteria.length > 0) {
             const firstLinked = assignment.linkedCriteria[0].criterionId;
             scores.set(assignment.id, grade.criterionScores[firstLinked] ?? null);
             continue;
        }

        if (assignment.evaluationMethod !== 'direct_grade' && assignment.evaluationToolId) {
            // For tool-based assignments (Internal Mode), the final score is the average of its calculated criterion scores.
            const criterionScores = Object.values(grade.criterionScores).filter((s): s is number => s !== null);
            if (criterionScores.length === 0) {
                scores.set(assignment.id, null);
            } else {
                const avg = criterionScores.reduce((a, b) => a + b, 0) / criterionScores.length;
                scores.set(assignment.id, avg);
            }
        } else {
            // Original logic for direct_grade (weighted average of criteria)
            let totalRatio = 0;
            let weightedSum = 0;
            assignment.linkedCriteria.forEach(lc => {
                const score = grade.criterionScores[lc.criterionId];
                if (score !== null && score !== undefined) {
                    weightedSum += score * lc.ratio;
                    totalRatio += lc.ratio;
                }
            });
            const finalScore = totalRatio === 0 ? null : weightedSum / totalRatio;
            scores.set(assignment.id, finalScore);
        }
    }
    return scores;
};

export const calculateEvaluationPeriodGradeForStudent = (studentId: string, classData: ClassData, evaluationPeriodId: string): { grade: number | null; styleClasses: string } => {
    const { assignments, categories } = classData;
    
    // Get the final, post-recovery grades for all criteria in the period
    const courseCriteria = classData.assignments
        .flatMap(a => {
             const grade = classData.grades.find(g => g.assignmentId === a.id && g.studentId === studentId);
             if (a.linkedCriteria.length > 0) return a.linkedCriteria.map(lc => lc.criterionId);
             if (grade?.criterionScores) return Object.keys(grade.criterionScores);
             return [];
        })
        .map(id => ({ id } as EvaluationCriterion)); 
        
    const finalCriterionGrades = calculateStudentCriterionGrades(studentId, classData, courseCriteria, evaluationPeriodId);

    const categoriesForPeriod = categories.filter(c => c.evaluationPeriodId === evaluationPeriodId && c.type !== 'recovery');
    
    let totalCategoryWeight = 0;
    let weightedCategorySum = 0;

    categoriesForPeriod.forEach(category => {
        const assignmentsInCategory = assignments.filter(a => a.categoryId === category.id);
        
        const criteriaInThisCategory = new Set<string>();
        assignmentsInCategory.forEach(a => {
            const grade = classData.grades.find(g => g.assignmentId === a.id && g.studentId === studentId);
            if (a.linkedCriteria.length > 0) {
                a.linkedCriteria.forEach(lc => criteriaInThisCategory.add(lc.criterionId));
            } else if (grade?.criterionScores) {
                Object.keys(grade.criterionScores).forEach(cid => criteriaInThisCategory.add(cid));
            }
        });

        if (criteriaInThisCategory.size === 0) return;

        const gradesForCategoryCriteria = Array.from(criteriaInThisCategory)
            .map(critId => finalCriterionGrades.get(critId))
            .filter((g): g is number => g !== null && g !== undefined);
        
        if (gradesForCategoryCriteria.length > 0) {
            const categoryAverage = gradesForCategoryCriteria.reduce((sum, g) => sum + g, 0) / gradesForCategoryCriteria.length;
            totalCategoryWeight += category.weight;
            weightedCategorySum += categoryAverage * category.weight;
        }
    });

    if (totalCategoryWeight === 0) return { grade: null, styleClasses: 'bg-transparent text-slate-500' };

    const finalGrade = weightedCategorySum / totalCategoryWeight;
    
    let styleClasses = 'bg-transparent text-slate-500';
    if (finalGrade < 5) styleClasses = 'bg-red-200 text-red-900';
    else if (finalGrade < 7) styleClasses = 'bg-yellow-200 text-yellow-900';
    else styleClasses = 'bg-green-200 text-green-900';
    
    return { grade: finalGrade, styleClasses };
};


export const calculateOverallFinalGradeForStudent = (studentId: string, classData: ClassData, academicConfiguration: AcademicConfiguration): { grade: string; styleClasses: string } => {
    const { evaluationPeriods, evaluationPeriodWeights = {} } = academicConfiguration;
    
    let totalWeightUsed = 0;
    let weightedSum = 0;

    evaluationPeriods.forEach(period => {
        const periodGradeResult = calculateEvaluationPeriodGradeForStudent(studentId, classData, period.id);
        const periodWeight = evaluationPeriodWeights[period.id];

        if (periodGradeResult.grade !== null && periodWeight) {
            weightedSum += periodGradeResult.grade * periodWeight;
            totalWeightUsed += periodWeight;
        }
    });

    if (totalWeightUsed === 0) return { grade: 'N/A', styleClasses: 'bg-transparent text-slate-500' };

    const finalGrade = weightedSum / totalWeightUsed;
    
    let styleClasses = 'bg-transparent text-slate-500';
    if (finalGrade < 5) styleClasses = 'bg-red-200 text-red-900';
    else if (finalGrade < 7) styleClasses = 'bg-yellow-200 text-yellow-900';
    else styleClasses = 'bg-green-200 text-green-900';

    return { grade: finalGrade.toFixed(2), styleClasses };
};

export const calculateStudentCriterionGrades = (
    studentId: string,
    classData: ClassData,
    criteria: EvaluationCriterion[],
    evaluationPeriodId?: string,
): Map<string, number | null> => {
    const { assignments, grades, categories } = classData;

    // 1. Filter assignments and grades for the relevant period and student.
    const relevantAssignments = evaluationPeriodId 
        ? assignments.filter(a => a.evaluationPeriodId === evaluationPeriodId)
        : assignments;
    
    const studentGrades = grades.filter(g => g.studentId === studentId);
    const studentGradesMap = new Map(studentGrades.map(g => [g.assignmentId, g]));

    // 2. Separate assignments into normal and recovery types.
    const normalAssignments = relevantAssignments.filter(a => {
        const category = categories.find(c => c.id === a.categoryId);
        return !category || category.type !== 'recovery';
    });
    
    const recoveryAssignments = relevantAssignments.filter(a => {
        const category = categories.find(c => c.id === a.categoryId);
        return category?.type === 'recovery' && studentGradesMap.has(a.id);
    });

    const finalCriterionGrades = new Map<string, number | null>();

    // 3. Calculate base grades for each criterion from *normal* assignments.
    for (const crit of criteria) {
        const scoresToAverage: number[] = [];
        for (const assignment of normalAssignments) {
            const grade = studentGradesMap.get(assignment.id);
            if (grade?.criterionScores && grade.criterionScores[crit.id] != null) {
                scoresToAverage.push(grade.criterionScores[crit.id] as number);
            }
        }
        
        if (scoresToAverage.length > 0) {
            const sum = scoresToAverage.reduce((a, b) => a + b, 0);
            finalCriterionGrades.set(crit.id, sum / scoresToAverage.length);
        } else {
            finalCriterionGrades.set(crit.id, null);
        }
    }

    // 4. Apply recovery grades. A single recovery assignment can improve multiple criteria.
    for (const recoveryAssignment of recoveryAssignments) {
        const recoveryGradeData = studentGradesMap.get(recoveryAssignment.id);
        const recoveryScore = recoveryGradeData?.criterionScores?.['recovery_grade'];

        if (recoveryScore !== null && recoveryScore !== undefined) {
            const recoveredAssignmentIds = new Set(recoveryAssignment.recoversAssignmentIds || []);
            
            const assignmentsBeingRecovered = assignments.filter(a => recoveredAssignmentIds.has(a.id));
            
            const criteriaToRecover = new Set<string>();
            assignmentsBeingRecovered.forEach(a => {
                const gradeOfRecoveredAssignment = studentGradesMap.get(a.id);
                if (gradeOfRecoveredAssignment?.criterionScores) {
                    Object.keys(gradeOfRecoveredAssignment.criterionScores).forEach(critId => {
                        if(critId !== 'recovery_grade') criteriaToRecover.add(critId);
                    });
                }
                // Also include criteria linked to the recovered assignment if it was tool-based-global or direct
                if (a.linkedCriteria) {
                    a.linkedCriteria.forEach(lc => criteriaToRecover.add(lc.criterionId));
                }
            });
            
            criteriaToRecover.forEach(critId => {
                const currentGrade = finalCriterionGrades.get(critId);
                if (currentGrade === null || currentGrade === undefined || recoveryScore > currentGrade) {
                    finalCriterionGrades.set(critId, recoveryScore);
                }
            });
        }
    }
    
    return finalCriterionGrades;
};

export const calculateStudentCompetenceGrades = (
    studentId: string,
    classData: ClassData,
    criteria: EvaluationCriterion[],
    competences: SpecificCompetence[],
    evaluationPeriodId?: string,
): Map<string, number | null> => {
    const studentCriterionGrades = calculateStudentCriterionGrades(studentId, classData, criteria, evaluationPeriodId);
    const competenceGrades = new Map<string, number | null>();
    
    for (const competence of competences) {
        const criteriaForCompetence = criteria.filter(c => c.competenceId === competence.id);
        if (criteriaForCompetence.length === 0) {
            competenceGrades.set(competence.id, null); continue;
        }
        const studentGradesForCriteria = criteriaForCompetence
            .map(c => studentCriterionGrades.get(c.id))
            .filter((g): g is number => g !== null && g !== undefined);
            
        if (studentGradesForCriteria.length === 0) {
            competenceGrades.set(competence.id, null); continue;
        }
        const sumOfAverages = studentGradesForCriteria.reduce((sum, grade) => sum + grade, 0);
        competenceGrades.set(competence.id, sumOfAverages / studentGradesForCriteria.length);
    }
    return competenceGrades;
};

export const calculateStudentKeyCompetenceGrades = (
    studentId: string, 
    classData: ClassData,
    criteria: EvaluationCriterion[], 
    competences: SpecificCompetence[], 
    keyCompetences: KeyCompetence[],
    evaluationPeriodId?: string
): Map<string, number | null> => {
    const studentCompetenceGrades = calculateStudentCompetenceGrades(studentId, classData, criteria, competences, evaluationPeriodId);
    const keyCompetenceGrades = new Map<string, number | null>();

    for (const keyCompetence of keyCompetences) {
        const linkedSpecificCompetences = competences.filter(sc => 
            (sc.keyCompetenceDescriptorIds || []).some(descId => 
                (keyCompetence.descriptors || []).some(desc => desc.id === descId)
            )
        );
        if (linkedSpecificCompetences.length === 0) {
            keyCompetenceGrades.set(keyCompetence.id, null);
            continue;
        }

        const gradesForCompetences = linkedSpecificCompetences
            .map(sc => studentCompetenceGrades.get(sc.id))
            .filter((g): g is number => g !== null && g !== undefined);
        
        if (gradesForCompetences.length === 0) {
            keyCompetenceGrades.set(keyCompetence.id, null);
            continue;
        }

        const sum = gradesForCompetences.reduce((acc, grade) => acc + grade, 0);
        const average = sum / gradesForCompetences.length;
        keyCompetenceGrades.set(keyCompetence.id, average);
    }
    return keyCompetenceGrades;
};
