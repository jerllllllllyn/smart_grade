import React, { useState, useEffect } from 'react';
import { GradingResult, QuestionResult, Language, FileWithPreview } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ResultViewProps {
  result: GradingResult;
  onReset: () => void;
  language: Language;
  onImproveInstructions: (feedback: string) => void;
  onUpdateScore: (newScore: number) => void;
  examFiles: FileWithPreview[];
}

interface ScoreCardProps {
  label: string;
  value: string | number;
  color?: string;
  editable?: boolean;
  onSave?: (val: number) => void;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ label, value, color = "text-blue-900", editable = false, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleSave = () => {
    if (onSave) {
      onSave(Number(tempValue));
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setTempValue(value);
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl border-2 border-blue-700 shadow-[4px_4px_0px_0px_rgba(29,78,216,1)] flex flex-col items-center justify-center relative group hover:-translate-y-1 transition-transform duration-200">
      <span className="text-blue-500 text-xs uppercase tracking-wider font-bold mb-1">{label}</span>
      
      {isEditing ? (
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-20 text-center border-b-4 border-blue-500 focus:outline-none text-2xl font-black p-1 bg-yellow-50"
            autoFocus
          />
          <button onClick={handleSave} className="text-green-600 hover:text-green-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </button>
          <button onClick={() => { setIsEditing(false); setTempValue(value); }} className="text-red-500 hover:text-red-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
            <span className={`text-3xl md:text-4xl font-black ${color}`}>{value}</span>
            {editable && (
              <button 
                onClick={() => setIsEditing(true)} 
                className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-blue-600 absolute top-2 right-2 md:static md:opacity-0 md:group-hover:opacity-100"
                title="Edit Score"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
              </button>
            )}
        </div>
      )}
    </div>
  );
};

const QuestionItem: React.FC<{ q: QuestionResult; language: Language }> = ({ q, language }) => {
  const t = {
    en: {
      correct: "Correct",
      incorrect: "Incorrect",
      studentAnswer: "Student Answer",
      correction: "Correction",
      rubricRef: "Rubric Reference",
      noAnswer: "No answer provided"
    },
    zh: {
      correct: "正确",
      incorrect: "错误",
      studentAnswer: "学生作答",
      correction: "参考答案/解析",
      rubricRef: "评分标准引用",
      noAnswer: "未作答"
    }
  };
  const text = t[language];

  return (
    <div className={`border-l-[6px] ${q.isCorrect ? 'border-green-500' : q.score > 0 ? 'border-yellow-400' : 'border-red-500'} border-2 border-r-2 border-t-2 border-b-2 border-slate-200 bg-white p-4 rounded-r-lg shadow-sm mb-4`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
            <span className="bg-yellow-100 border border-yellow-300 text-yellow-800 font-bold px-2 py-1 rounded text-xs tracking-wide">Q{q.questionId}</span>
            <span className={`text-sm font-bold ${q.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {q.isCorrect ? text.correct : text.incorrect}
            </span>
        </div>
        <div className="font-mono text-sm font-black text-blue-900 bg-blue-50 px-2 py-1 rounded">
            {q.score} / {q.maxScore} pts
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4 text-sm">
        <div>
            <p className="text-xs text-slate-400 uppercase font-bold mb-1">{text.studentAnswer}</p>
            <p className="text-slate-800 bg-slate-50 border border-slate-200 p-2 rounded-md font-medium">{q.studentAnswer || text.noAnswer}</p>
        </div>
        {!q.isCorrect && (
             <div>
                <p className="text-xs text-slate-400 uppercase font-bold mb-1">{text.correction}</p>
                <p className="text-green-800 bg-green-50 border border-green-200 p-2 rounded-md font-medium">{q.correction}</p>
            </div>
        )}
      </div>

      {q.rubricReference && (
        <div className="mt-3">
             <p className="text-xs text-blue-400 uppercase font-bold mb-1">{text.rubricRef}</p>
             <p className="text-blue-900 bg-blue-50 p-2 rounded text-xs border border-blue-200 italic font-medium">
                "{q.rubricReference}"
             </p>
        </div>
      )}
      
      {q.comments && (
        <div className="mt-3 text-sm text-slate-600 italic border-t border-slate-100 pt-2">
            " {q.comments} "
        </div>
      )}
    </div>
  );
};

const ResultView: React.FC<ResultViewProps> = ({ result, onReset, language, onImproveInstructions, onUpdateScore, examFiles }) => {
  const [feedback, setFeedback] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const percentage = Math.round((result.totalScore / result.maxScore) * 100);
  
  const chartData = [
    { name: 'Correct', value: result.totalScore, color: '#1d4ed8' }, // Blue 700
    { name: 'Missed', value: Math.max(0, result.maxScore - result.totalScore), color: '#fde047' }, // Yellow 300
  ];

  const t = {
    en: {
      reportTitle: "Grading Report",
      student: "Student",
      gradeAnother: "Grade Another",
      unknown: "Unknown",
      letterGrade: "Letter Grade",
      totalScore: "Total Score",
      maxScore: "Max Score",
      teacherSummary: "Teacher's Summary",
      feedbackTitle: "Feedback for Student",
      detailedAnalysis: "Detailed Analysis",
      improveTitle: "Improve Grading Standard",
      improveDesc: "Did the AI grade incorrectly? Provide your feedback below (e.g., 'Student should get partial credit for X', 'Strictly penalize missing keyword Y'). We will update the grading instructions.",
      improvePlaceholder: "E.g. Student missed 'regeneration' which is a key concept for cultural innovation. Deduct points if missing.",
      improveButton: "Update Instructions & Re-grade",
      originalExam: "Student Exam Images",
      clickToZoom: "Click to zoom"
    },
    zh: {
      reportTitle: "阅卷报告",
      student: "学生姓名",
      gradeAnother: "批改下一份",
      unknown: "未知",
      letterGrade: "等级",
      totalScore: "总得分",
      maxScore: "满分",
      teacherSummary: "教师评语",
      feedbackTitle: "给学生的建议",
      detailedAnalysis: "详细分析",
      improveTitle: "优化评分标准",
      improveDesc: "AI 判分不准确？请在下方输入您的反馈（例如：“没提到甘坑古镇扣分”，“再生是文化创新的关键点”）。我们将据此更新评分指令。",
      improvePlaceholder: "例如：学生没有结合甘坑古镇或者客家人材料进行阐述，也没有对再生进行描述，因此只能给4分...",
      improveButton: "更新指令并重新开始",
      originalExam: "原始试卷图片",
      clickToZoom: "点击放大查看"
    }
  };

  const text = t[language];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-4 border-blue-200 pb-6">
        <div>
            <h2 className="text-3xl font-black text-blue-900 uppercase tracking-tight">{text.reportTitle}</h2>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-bold bg-yellow-300 text-blue-900 px-2 py-0.5 rounded border border-blue-900">{text.student}</span>
                <span className="text-blue-700 font-medium">{result.studentName || text.unknown}</span>
            </div>
        </div>
        <button 
            onClick={onReset}
            className="px-5 py-2 bg-white border-2 border-blue-700 text-blue-700 font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-[4px_4px_0px_0px_rgba(29,78,216,0.3)] hover:shadow-[4px_4px_0px_0px_rgba(29,78,216,1)] hover:-translate-y-0.5"
        >
            {text.gradeAnother}
        </button>
      </div>

      {/* Original Exam Images (Moved to top) */}
      <div className="bg-white rounded-xl shadow-[4px_4px_0px_0px_rgba(29,78,216,1)] border-2 border-blue-700 p-6">
        <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-yellow-400"></span>
            {text.originalExam}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {examFiles.map((file, idx) => (
            <div 
              key={idx} 
              className="relative group rounded-lg overflow-hidden border-2 border-blue-100 bg-slate-50 cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => setSelectedImage(file.previewUrl)}
            >
               <img 
                 src={file.previewUrl} 
                 alt={`Exam page ${idx + 1}`} 
                 className="w-full h-full object-cover aspect-[3/4]"
               />
               <div className="absolute top-2 left-2 bg-blue-900 text-white text-xs px-2 py-1 font-bold rounded">
                 P{idx + 1}
               </div>
               <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/10 transition-colors flex items-center justify-center">
                 <div className="opacity-0 group-hover:opacity-100 bg-white text-blue-900 text-xs font-bold px-3 py-1.5 rounded-full border-2 border-blue-900 shadow-sm transform scale-90 group-hover:scale-100 transition-all">
                    {text.clickToZoom}
                 </div>
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="col-span-2 md:col-span-1 h-32 relative bg-white rounded-xl shadow-[4px_4px_0px_0px_rgba(29,78,216,1)] border-2 border-blue-700 overflow-hidden">
             {/* Simple Chart */}
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={35}
                            outerRadius={50}
                            startAngle={90}
                            endAngle={-270}
                            dataKey="value"
                            stroke="none"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                 </ResponsiveContainer>
                </div>
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                    <span className="text-xl font-black text-blue-900">{percentage}%</span>
                </div>
             </div>
        </div>
        <ScoreCard label={text.letterGrade} value={result.letterGrade} color="text-blue-700" />
        <ScoreCard 
          label={text.totalScore} 
          value={result.totalScore} 
          editable={true} 
          onSave={onUpdateScore}
        />
        <ScoreCard label={text.maxScore} value={result.maxScore} color="text-slate-400" />
      </div>

      {/* AI Summary */}
      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6 shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]">
        <h3 className="text-lg font-bold text-blue-900 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
            {text.teacherSummary}
        </h3>
        <p className="text-blue-900 leading-relaxed font-medium">{result.summary}</p>
        <div className="mt-4 pt-4 border-t-2 border-yellow-200">
             <h4 className="text-sm font-bold text-blue-800 mb-1">{text.feedbackTitle}</h4>
             <p className="text-blue-700 italic">"{result.constructiveFeedback}"</p>
        </div>
      </div>

      {/* Question Analysis */}
      <div>
        <h3 className="text-xl font-black text-blue-900 mb-4 border-b-2 border-blue-200 pb-2">{text.detailedAnalysis}</h3>
        <div className="space-y-4">
            {result.questions.map((q, idx) => (
                <QuestionItem key={idx} q={q} language={language} />
            ))}
        </div>
      </div>

      {/* Improvement Feedback Section */}
      <div className="bg-white border-2 border-blue-900 rounded-xl p-6 mt-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-400 -mr-8 -mt-8 rotate-45"></div>
        <h3 className="text-lg font-bold text-blue-900 mb-2">{text.improveTitle}</h3>
        <p className="text-slate-600 text-sm mb-4 font-medium">{text.improveDesc}</p>
        <textarea 
            className="w-full p-3 rounded-lg border-2 border-blue-200 focus:ring-0 focus:border-blue-700 text-sm mb-3 font-medium transition-colors"
            rows={3}
            placeholder={text.improvePlaceholder}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
        />
        <button 
            onClick={() => onImproveInstructions(feedback)}
            disabled={!feedback.trim()}
            className="px-4 py-2 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-none"
        >
            {text.improveButton}
        </button>
      </div>

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-blue-900/90 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white hover:text-yellow-300 transition-colors bg-white/10 rounded-full p-2"
            onClick={() => setSelectedImage(null)}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          <img 
            src={selectedImage} 
            alt="Full size exam" 
            className="max-w-full max-h-full object-contain rounded-lg border-4 border-white shadow-2xl"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}

    </div>
  );
};

export default ResultView;