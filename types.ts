export interface GradingResult {
  studentName?: string;
  totalScore: number;
  maxScore: number;
  letterGrade: string;
  summary: string;
  questions: QuestionResult[];
  constructiveFeedback: string;
}

export interface QuestionResult {
  questionId: string;
  score: number;
  maxScore: number;
  isCorrect: boolean;
  studentAnswer: string; // Brief description or OCR of what they wrote
  correction: string; // Correct answer or explanation
  rubricReference?: string; // Specific quote from the rubric used for grading
  comments: string;
}

export interface FileWithPreview {
  file: File;
  previewUrl: string;
  base64?: string;
  mimeType: string;
}

export type GradingStatus = 'idle' | 'processing' | 'success' | 'error' | 'improving';

export type Language = 'en' | 'zh';