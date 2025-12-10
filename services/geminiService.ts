import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GradingResult, FileWithPreview, Language } from '../types';

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const gradingSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    studentName: { type: Type.STRING, description: "Inferred name of the student if visible, else 'Student'" },
    totalScore: { type: Type.NUMBER, description: "Total points earned" },
    maxScore: { type: Type.NUMBER, description: "Total possible points" },
    letterGrade: { type: Type.STRING, description: "Letter grade (A, B, C, etc.)" },
    summary: { type: Type.STRING, description: "A brief summary of performance" },
    constructiveFeedback: { type: Type.STRING, description: "Encouraging feedback for the student" },
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          questionId: { type: Type.STRING, description: "Question number or label (e.g., '1', '2a')" },
          score: { type: Type.NUMBER, description: "Points earned for this question" },
          maxScore: { type: Type.NUMBER, description: "Max points for this question" },
          isCorrect: { type: Type.BOOLEAN },
          studentAnswer: { type: Type.STRING, description: "Brief text description of the student's answer" },
          correction: { type: Type.STRING, description: "The correct answer and explanation if wrong" },
          rubricReference: { type: Type.STRING, description: "Quote the specific text from the rubric/answer key image that justifies this score." },
          comments: { type: Type.STRING, description: "Specific comments on this question" },
        },
        required: ["questionId", "score", "maxScore", "isCorrect", "studentAnswer", "correction", "comments"]
      }
    }
  },
  required: ["totalScore", "maxScore", "letterGrade", "summary", "questions", "constructiveFeedback"]
};

export const gradeExam = async (
  examFiles: FileWithPreview[],
  rubricFiles: FileWithPreview[],
  instructions: string,
  language: Language
): Promise<GradingResult> => {
  
  const parts: any[] = [];

  const langInstruction = language === 'zh' 
    ? "IMPORTANT: Provide ALL text fields (summary, feedback, studentAnswer, correction, comments, rubricReference) in Simplified Chinese (简体中文)." 
    : "IMPORTANT: Provide all text fields in English.";

  // 1. Add System/Context prompts as text
  let promptText = `
    You are an expert academic grader for K-12 education. 
    Your task is to grade a student's exam paper based on the provided answer key (rubric) and optional instructions.
    
    ${langInstruction}

    Instructions:
    1. Analyze the 'Rubric/Answer Key' images to understand the correct answers and point distribution.
    2. Analyze the 'Student Exam' images. 
    3. Grade each question carefully. Partial credit is allowed if the rubric implies it or if the student shows partial understanding (unless strict grading is requested).
    4. For every question, you MUST quote the specific part of the rubric/answer key that explains why you gave that score in the 'rubricReference' field.
    5. Be fair, consistent, and constructive.
    6. If the student's handwriting is illegible, mark it as 0 and note it in comments.
    7. Return the result in the specified JSON format.
  `;

  if (instructions.trim()) {
    promptText += `\n\nAdditional Teacher Instructions: ${instructions}`;
  }

  promptText += `\n\nBelow are the images. First, the Answer Key/Rubric, then the Student Exam.`;

  parts.push({ text: promptText });

  // 2. Add Rubric Images
  rubricFiles.forEach((f, index) => {
    if (f.base64) {
      parts.push({ text: `[Image: Rubric Page ${index + 1}]` });
      parts.push({
        inlineData: {
          mimeType: f.mimeType,
          data: f.base64
        }
      });
    }
  });

  // 3. Add Student Exam Images
  examFiles.forEach((f, index) => {
    if (f.base64) {
      parts.push({ text: `[Image: Student Exam Page ${index + 1}]` });
      parts.push({
        inlineData: {
          mimeType: f.mimeType,
          data: f.base64
        }
      });
    }
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: gradingSchema,
        temperature: 0.2, // Low temperature for consistent grading
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text) as GradingResult;
      return data;
    } else {
      throw new Error("No response text generated");
    }
  } catch (error) {
    console.error("Grading failed:", error);
    throw error;
  }
};

export const generateImprovedInstructions = async (
  currentInstructions: string,
  teacherFeedback: string,
  language: Language
): Promise<string> => {
  
  const prompt = `
    You are a helpful assistant for a teacher.
    The teacher is providing feedback on how an exam was graded to improve future grading consistency.
    
    Current Instructions: "${currentInstructions}"
    
    Teacher's Complaint/Feedback: "${teacherFeedback}"
    
    Task:
    Based on the teacher's feedback, formulate a clear, concise, and specific instruction rule that should be added to the grading instructions.
    This new rule should ensure that the AI grader accounts for the specific issue mentioned by the teacher (e.g., deducting points for missing keywords, checking for specific concepts like 'regeneration' or 'Gankeng Ancient Town').
    
    Output Format:
    Return ONLY the text of the new instruction rule. Do not include conversational text.
    If the language is Chinese, return the rule in Chinese.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("Failed to improve instructions:", error);
    throw error;
  }
};