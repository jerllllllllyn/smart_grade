import React, { useState, useCallback } from 'react';
import { GradingResult, GradingStatus, FileWithPreview, Language } from './types';
import { gradeExam, generateImprovedInstructions } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import ResultView from './components/ResultView';

const translations = {
  en: {
    title: "SmartGrade",
    subtitle: "AI",
    description: "Automated Assistant for Teachers",
    heroTitle: "Grade Exams in Seconds",
    heroDesc: "Upload the student's work and your answer key. AI will analyze handwriting, check answers, and generate a report card.",
    rubricTitle: "Answer Key / Rubric",
    rubricUpload: "Upload Rubric Images",
    rubricStep: "1",
    instructionsTitle: "Grading Instructions (Optional)",
    instructionsPlaceholder: "E.g., Be strict on grammar. Question 3 is worth 5 bonus points. Ignore spelling mistakes.",
    studentStep: "2",
    studentTitle: "Student Exam",
    studentUpload: "Upload Exam Images",
    errorFiles: "Please upload at least one exam image and one rubric/key image.",
    gradeButton: "Grade Exam Now",
    gradingButton: "Grading Exam...",
    improvingButton: "Updating Standard...",
    footer: "Powered by Gemini 2.5 Flash. Check output carefully before finalizing grades."
  },
  zh: {
    title: "智批",
    subtitle: "AI",
    description: "教师的自动化批改助手",
    heroTitle: "几秒钟完成阅卷",
    heroDesc: "上传学生作业和答案解析。AI 将分析手写内容、检查答案并生成成绩单。",
    rubricTitle: "答案 / 评分标准",
    rubricUpload: "上传评分标准图片",
    rubricStep: "1",
    instructionsTitle: "批改说明 (可选)",
    instructionsPlaceholder: "例如：严格检查语法。第3题有5分附加分。忽略拼写错误。",
    studentStep: "2",
    studentTitle: "学生试卷",
    studentUpload: "上传试卷图片",
    errorFiles: "请至少上传一张试卷图片和一张答案图片。",
    gradeButton: "开始阅卷",
    gradingButton: "正在阅卷...",
    improvingButton: "正在更新标准...",
    footer: "由 Gemini 2.5 Flash 驱动。请仔细核对结果。"
  }
};

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('zh');
  const [examFiles, setExamFiles] = useState<FileWithPreview[]>([]);
  const [rubricFiles, setRubricFiles] = useState<FileWithPreview[]>([]);
  const [instructions, setInstructions] = useState<string>("");
  const [status, setStatus] = useState<GradingStatus>('idle');
  const [result, setResult] = useState<GradingResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const t = translations[language];

  const handleGrade = useCallback(async () => {
    if (examFiles.length === 0 || rubricFiles.length === 0) {
      setErrorMessage(t.errorFiles);
      return;
    }

    setStatus('processing');
    setErrorMessage(null);

    try {
      const gradingResult = await gradeExam(examFiles, rubricFiles, instructions, language);
      setResult(gradingResult);
      setStatus('success');
    } catch (error: any) {
      console.error(error);
      setStatus('error');
      setErrorMessage(error.message || "An unexpected error occurred during grading.");
    }
  }, [examFiles, rubricFiles, instructions, language, t.errorFiles]);

  const handleReset = () => {
    setResult(null);
    setStatus('idle');
    setExamFiles([]);
    setRubricFiles([]);
    setInstructions("");
    setErrorMessage(null);
  };

  const handleUpdateScore = (newScore: number) => {
    if (result) {
      setResult({ ...result, totalScore: newScore });
    }
  };

  const handleImproveInstructions = async (feedback: string) => {
    if (!feedback) return;
    setStatus('improving');
    try {
        const newRule = await generateImprovedInstructions(instructions, feedback, language);
        if (newRule) {
            setInstructions(prev => {
                const prefix = prev ? prev + "\n\n" : "";
                return prefix + `[Updated Rule]: ${newRule}`;
            });
            // Return to input view to let teacher re-grade or grade next
            setResult(null);
            setStatus('idle');
            // Optional: You could trigger a toast notification here
        } else {
             // Fallback if AI returns empty
             setStatus('success');
        }
    } catch (error) {
        console.error("Failed to improve instructions", error);
        setStatus('success'); // Stay on result view if failed
    }
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'zh' : 'en');
  };

  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-yellow-400 border-b-4 border-blue-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-700 rounded-md p-1.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
               <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
            </div>
            <h1 className="text-xl font-extrabold text-blue-900 tracking-tight">{t.title}<span className="text-blue-700">{t.subtitle}</span></h1>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="text-sm text-blue-900 font-medium hidden md:block">
               {t.description}
             </div>
             <button 
                onClick={toggleLanguage}
                className="px-3 py-1 text-sm font-bold bg-white text-blue-800 border-2 border-blue-800 rounded-md hover:bg-blue-50 transition-transform active:scale-95 shadow-[2px_2px_0px_0px_rgba(30,64,175,1)]"
             >
                {language === 'en' ? '中文' : 'English'}
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {status === 'improving' ? (
             <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-700 mb-4"></div>
                <h3 className="text-xl font-bold text-blue-900">{t.improvingButton}</h3>
                <p className="text-blue-700 mt-2 font-medium">AI is learning from your feedback...</p>
             </div>
        ) : status === 'success' && result ? (
          <ResultView 
            result={result} 
            onReset={handleReset} 
            language={language}
            onImproveInstructions={handleImproveInstructions}
            onUpdateScore={handleUpdateScore}
            examFiles={examFiles}
          />
        ) : (
          <div className="flex flex-col gap-8 animate-fade-in-up">
            
            <div className="text-center max-w-2xl mx-auto mb-4">
                <h2 className="text-3xl font-black text-blue-900 sm:text-4xl">{t.heroTitle}</h2>
                <p className="mt-4 text-lg text-blue-800 font-medium">{t.heroDesc}</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-start">
              
              {/* Left Column: Rubric */}
              <div className="bg-white rounded-xl p-6 border-2 border-blue-700 shadow-[8px_8px_0px_0px_rgba(29,78,216,0.2)] hover:shadow-[8px_8px_0px_0px_rgba(29,78,216,1)] transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-6">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-400 border-2 border-blue-800 text-blue-900 font-bold text-lg">{t.rubricStep}</span>
                    <h3 className="text-xl font-bold text-blue-900">{t.rubricTitle}</h3>
                </div>
                <ImageUploader 
                  label={t.rubricUpload} 
                  files={rubricFiles} 
                  onFilesChange={setRubricFiles} 
                  maxFiles={5}
                  language={language}
                />
                 <div className="mt-6">
                  <label className="block text-sm font-bold text-blue-900 mb-2">{t.instructionsTitle}</label>
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder={t.instructionsPlaceholder}
                    className="w-full rounded-lg border-2 border-blue-200 focus:border-blue-600 focus:ring-0 shadow-sm min-h-[100px] p-3 text-sm text-slate-700 placeholder:text-slate-400 font-medium transition-colors"
                  />
                </div>
              </div>

              {/* Right Column: Student Work */}
              <div className="bg-white rounded-xl p-6 border-2 border-blue-700 shadow-[8px_8px_0px_0px_rgba(29,78,216,0.2)] hover:shadow-[8px_8px_0px_0px_rgba(29,78,216,1)] transition-shadow duration-300">
                 <div className="flex items-center gap-3 mb-6">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-800 text-blue-800 font-bold text-lg">{t.studentStep}</span>
                    <h3 className="text-xl font-bold text-blue-900">{t.studentTitle}</h3>
                </div>
                <ImageUploader 
                  label={t.studentUpload} 
                  files={examFiles} 
                  onFilesChange={setExamFiles} 
                  maxFiles={10}
                  language={language}
                />
                
                {/* Action Area */}
                <div className="mt-8 pt-6 border-t-2 border-blue-100">
                    {errorMessage && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4 text-sm flex items-start border-2 border-red-200">
                             <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                             {errorMessage}
                        </div>
                    )}
                    
                    <button
                        onClick={handleGrade}
                        disabled={status === 'processing'}
                        className={`w-full py-4 px-6 rounded-xl font-black text-lg text-white transition-all transform hover:-translate-y-1 active:translate-y-0
                            ${status === 'processing' 
                                ? 'bg-slate-400 cursor-not-allowed opacity-75 border-2 border-slate-500' 
                                : 'bg-blue-700 hover:bg-blue-600 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                            }
                        `}
                    >
                        {status === 'processing' ? (
                            <div className="flex items-center justify-center gap-3">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {t.gradingButton}
                            </div>
                        ) : (
                            t.gradeButton
                        )}
                    </button>
                    <p className="text-center text-xs text-blue-400 font-bold mt-3">
                        {t.footer}
                    </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;