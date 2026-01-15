

import { GoogleGenAI } from "@google/genai";
import type { EvaluationCriterion } from '../types';

// FIX: Per coding guidelines, initialize the client directly with process.env.API_KEY
// and assume it is always available. Use GoogleGenAI instead of GoogleGenerativeAI.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateFeedback = async (
    studentName: string,
    assignmentName: string,
    score: number,
    criteria: EvaluationCriterion[]
): Promise<string> => {
    // FIX: Per coding guidelines, we assume the API_KEY is present, so the check is removed.
    const criteriaText = criteria.map(c => `- ${c.description}`).join('\n');
    const prompt = `
        Eres un asistente para profesores. Genera un comentario breve, constructivo y alentador en español para un alumno.

        Detalles:
        - Nombre del alumno: ${studentName}
        - Tarea: ${assignmentName}
        - Calificación: ${score} sobre 10
        - Criterios evaluados en esta tarea:
        ${criteriaText}

        Instrucciones:
        1. Comienza con un comentario positivo sobre el esfuerzo o un aspecto bien logrado.
        2. Menciona un área específica de mejora relacionada con los criterios evaluados, ofreciendo una sugerencia práctica.
        3. Termina con una nota de ánimo.
        4. Mantén el texto conciso, entre 2 y 4 frases.
        5. No incluyas el nombre del alumno en la respuesta, solo el feedback.
    `;

    try {
        // FIX: Updated to use the new `ai.models.generateContent` API and get the text directly from `response.text`.
        // The model is changed to `gemini-2.5-flash` for basic text tasks.
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating feedback:", error);
        return "Hubo un error al generar los comentarios. Por favor, inténtelo de nuevo.";
    }
};
