import React, { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { quizService } from '../../services/quizService';
import { ROUTES } from '../../../../core/router/paths';
import type { IQuizAttempt } from '../../types/quiz.types';
import { CheckCircle, XCircle, Trophy, ArrowLeft, BrainCircuit, Sparkles, MessageSquare, RefreshCw, AlertCircle, Timer } from 'lucide-react';
import Spiner from '@shared/ui/Spiner';
import QuestionRenderer from '../../components/student/QuestionRenderer';

const QuizResult: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  useEffect(()=>{
    window.scrollTo({
      top:0,
      behavior:'smooth'
    })
  },[])

  const { data: allAttempts, isLoading: isResultLoading, refetch } = useQuery({
    queryKey: ['quizAllAttempts', courseId],
    queryFn: () => quizService.getAllAttempts(courseId!),
    retry: false,
    refetchInterval: (query) => {
      const data = query.state.data as IQuizAttempt[];
      if (!data || data.length === 0) return false;
      const latest = data[data.length - 1];
      const isTerminal = latest.status === 'completed' || latest.status === 'timed_out';
      return (isTerminal && !latest.aiFeedback) ? 2000 : false;
    }
  });

  const { data: config, isLoading: isConfigLoading } = useQuery({
    queryKey: ['quizConfig', courseId],
    queryFn: () => quizService.getConfig(courseId!),
    retry: false,
  });

  const [selectedAttemptIndex, setSelectedAttemptIndex] = React.useState<number>(0);

  useEffect(() => {
    if (allAttempts && allAttempts.length > 0) {
      // Favor the latest terminal attempt (completed or timed_out) for initial view
      const latestTerminalIdx = [...allAttempts].reverse().findIndex(
        (a) => a.status === 'completed' || a.status === 'timed_out'
      );
      if (latestTerminalIdx !== -1) {
        setSelectedAttemptIndex(allAttempts.length - 1 - latestTerminalIdx);
      } else {
        // Fallback to latest attempt (likely in-progress)
        setSelectedAttemptIndex(allAttempts.length - 1);
      }
    }
  }, [allAttempts]);

  const result = allAttempts ? allAttempts[selectedAttemptIndex] : null;

  useEffect(() => {
    if (result && result.status !== 'completed' && result.status !== 'timed_out') {
      refetch();
    }
  }, [result, refetch]);

  const isLoading = isResultLoading || isConfigLoading;

  const [displayedCount, setDisplayedCount] = useState<number>(5);

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: "200px", // Trigger 200px before the user reaches the bottom
  });

  useEffect(() => {
    setDisplayedCount(5);
  }, [selectedAttemptIndex]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const questions = result?.questions || [];
    if (inView && result && displayedCount < questions.length) {
      timer = setTimeout(() => {
        setDisplayedCount(prev => Math.min(prev + 5, questions.length));
      }, 100); // 100ms gives the browser enough time to recalculate the layout and update inView
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [inView, result, displayedCount]);
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-800"><Spiner /></div>;

  // If no attempts found at all
  if (!allAttempts || allAttempts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-800 flex-col gap-6 p-6">
        <div className="bg-white dark:bg-gray-700 p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-600 text-center max-w-md">
          <BrainCircuit className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <p className="text-gray-900 dark:text-white font-bold text-xl">No quiz attempts found</p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Start a quiz to see your performance metrics here.</p>
          <button 
            onClick={() => navigate(ROUTES.student.quiz.landing.replace(':courseId', courseId!))}
            className="mt-8 w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  // If the selected attempt is still in-progress (not yet a terminal state)
  if (result && result.status === 'in_progress') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-800 flex-col gap-6 p-6">
        <div className="bg-white dark:bg-gray-700 p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-600 text-center max-w-md">
          <RefreshCw className="w-16 h-16 text-indigo-500 mx-auto mb-6 animate-spin" />
          <p className="text-gray-900 dark:text-white font-bold text-xl">Attempt In Progress</p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            You have an active session for this quiz. Please complete it to see your results.
          </p>
          
          <button 
            onClick={() => {
              const id = result.attemptId || result._id || result.id || '';
              navigate(ROUTES.student.quiz.session.replace(':courseId', courseId!).replace(':attemptId', id));
            }}
            className="mt-8 w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
          >
            Resume Assessment
          </button>

          {allAttempts.length > 1 && (
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-600">
              <p className="text-xs text-gray-400 uppercase font-bold mb-4">Or view previous attempts</p>
              <div className="flex flex-wrap justify-center gap-2">
                {allAttempts.map((a, idx) => (a.status === 'completed' || a.status === 'timed_out') && (
                  <button 
                    key={idx}
                    onClick={() => setSelectedAttemptIndex(idx)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Attempt {a.attemptNumber}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-800 p-6">
        <div className="max-w-md w-full text-center bg-white dark:bg-gray-700 rounded-3xl shadow-xl p-10 border border-gray-100 dark:border-gray-600">
          <AlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">No Results Found</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">We couldn't find any completed quiz attempts for this course.</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-8 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isPassed = result.passed;
  const isTimedOut = result.status === 'timed_out';
  const correctCount = result.perQuestionResult?.filter((r) => r.isCorrect).length || 0;
  const totalQuestions = result.questions?.length || 0;
  const requiredToPass = config ? Math.ceil((config.passPercentage / 100) * totalQuestions) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
        
        <button 
          onClick={() => navigate(ROUTES.course.details.replace(':id', courseId!))}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> BACK TO LEARNING
        </button>

        {allAttempts && allAttempts.length > 1 && (
          <div className="flex items-center justify-center mb-8">
            <div className="inline-flex bg-gray-200/50 dark:bg-gray-700/50 p-1.5 rounded-2xl backdrop-blur-sm border border-gray-200 dark:border-gray-600">
              {allAttempts.map((attempt, index) => (
                <button
                  key={attempt.attemptId || attempt._id || attempt.id || index}
                  onClick={() => setSelectedAttemptIndex(index)}
                  className={`relative px-8 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 cursor-pointer flex items-center gap-2 ${
                    selectedAttemptIndex === index
                      ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/40 dark:hover:bg-gray-600/40'
                  }`}
                >
                  Attempt {attempt.attemptNumber}
                  {selectedAttemptIndex === index && (
                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-indigo-600 dark:bg-indigo-500 rounded-t-full shadow-[0_-2px_10px_rgba(79,70,229,0.5)]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Hero Result Card */}
        <div className={`relative bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl overflow-hidden border-b-[12px] ${
          isTimedOut ? 'border-amber-500' : isPassed ? 'border-green-500' : 'border-red-500'
        }`}>
          {/* Animated background element */}
          <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-20 ${
            isTimedOut ? 'bg-amber-500' : isPassed ? 'bg-green-500' : 'bg-red-500'
          }`} />

          <div className="p-8 md:p-12 text-center relative z-10">
            <div className={`w-24 h-24 mx-auto rounded-[2rem] flex items-center justify-center mb-8 transform rotate-6 shadow-xl ${
              isTimedOut
                ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'
                : isPassed
                ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400'
                : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
            }`}>
              {isTimedOut ? <Timer className="w-12 h-12" /> : isPassed ? <Trophy className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
              {isTimedOut ? 'TIME EXPIRED' : isPassed ? 'MISSION ACCOMPLISHED!' : 'UNSUCCESSFUL ATTEMPT'}
            </h1>

            {/* Time Expired Banner */}
            {isTimedOut && (
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-full mb-4">
                <Timer className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <p className="text-sm font-black text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                  Quiz auto-submitted — time limit reached
                </p>
              </div>
            )}
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-full border border-gray-100 dark:border-gray-600 mb-8">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <p className="text-sm font-bold text-gray-600 dark:text-gray-300">
                {isTimedOut
                  ? 'Score based on answers submitted before time ran out.'
                  : isPassed
                  ? 'You have officially passed the assessment.'
                  : 'Minimum pass score not reached.'}
              </p>
            </div>

            <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-12 pt-10">
              <div className="text-center opacity-60">
                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-2">Accuracy</p>
                <p className={`text-4xl font-black ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                  {result.score}<span className="text-xl">%</span>
                </p>
              </div>

              <div className="text-center bg-gray-50 dark:bg-gray-800/50 p-8 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-inner transform scale-110">
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-3">Total Performance</p>
                <p className="text-7xl font-black text-gray-900 dark:text-white leading-none">
                  {correctCount}<span className="text-3xl text-gray-300 dark:text-gray-600 mx-1">/</span>{totalQuestions}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 rounded-full">
                  <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">Need {requiredToPass} to Pass</p>
                </div>
              </div>

              <div className="text-center opacity-60">
                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-2">Attempt Log</p>
                <p className="text-4xl font-black text-gray-900 dark:text-white">
                  <span className="text-xl text-gray-300 dark:text-gray-600">#</span>{result.attemptNumber}
                </p>
              </div>
            </div>

            <div className="mt-12 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl border border-indigo-100 dark:border-indigo-900/40 text-left relative group min-h-[100px]">
              <MessageSquare className="absolute -top-3 -left-3 w-8 h-8 text-indigo-600 dark:text-indigo-400 fill-indigo-50 dark:fill-gray-700" />
              <p className="text-indigo-900 dark:text-indigo-300 font-bold text-sm mb-2 uppercase tracking-widest flex items-center gap-2">
                <BrainCircuit className={`w-4 h-4 ${!result.aiFeedback ? 'animate-pulse text-indigo-500' : ''}`} /> 
                AI MENTOR FEEDBACK
              </p>
              {result.aiFeedback ? (
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {result.aiFeedback}
                </p>
              ) : (
                <div className="space-y-2 py-2">
                  <div className="h-4 bg-indigo-200/50 dark:bg-indigo-800/30 rounded-full w-3/4 animate-pulse" />
                  <div className="h-4 bg-indigo-200/50 dark:bg-indigo-800/30 rounded-full w-1/2 animate-pulse" />
                  <p className="text-xs text-indigo-400 dark:text-indigo-500 font-bold mt-4 animate-pulse uppercase tracking-tighter italic">
                    Mentor is analyzing your performance...
                  </p>
                </div>
              )}
            </div>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
               {config && result.attemptNumber < config.maxAttempts && (
                 <button
                   onClick={() => navigate(ROUTES.student.quiz.landing.replace(':courseId', courseId!))}
                   className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
                 >
                   <RefreshCw className="w-5 h-5" /> RETAKE ASSESSMENT
                 </button>
               )}
               <button
                 onClick={() => navigate(ROUTES.course.details.replace(':id', courseId!))}
                 className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 font-black rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer"
               >
                 BACK TO COURSE
               </button>
            </div>
          </div>
        </div>

        {/* Detailed Answers Review */}
        <div className="space-y-8 mt-16">
          <div className="flex items-center gap-3 px-2">
            <div className="w-1.5 h-8 bg-indigo-600 rounded-full" />
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">DETAILED BREAKDOWN</h2>
          </div>
          
          <div className="space-y-6">
            {(result.questions || []).slice(0, displayedCount).map((question, index) => {
              const studentAnswer = result.answers?.find((a) => a.questionId === question.questionId);
              const isCorrect = result.perQuestionResult?.find((r) => r.questionId === question.questionId)?.isCorrect;

              return (
                <div key={question.questionId} className={`group bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-xl border-l-[8px] transition-all hover:-translate-y-1 cursor-pointer ${
                  isCorrect ? 'border-green-500' : 'border-red-500'
                }`}>
                  <div className="flex items-start gap-6">
                    <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                      isCorrect ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
                    }`}>
                      {isCorrect ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                    </div>
                    
                    <div className="flex-1 space-y-6">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Question {index + 1}</p>
                        <div className="mt-2">
                          <QuestionRenderer text={question.questionText} />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`p-5 rounded-2xl border-2 ${
                          isCorrect ? 'bg-green-50/30 dark:bg-green-900/10 border-green-100 dark:border-green-900/30' : 'bg-red-50/30 dark:bg-red-900/10 border-red-100 dark:border-red-900/30'
                        }`}>
                          <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Your Selection</p>
                          <p className={`font-black text-lg ${isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                            {question.type === 'mcq' 
                              ? (studentAnswer?.selectedOptionIndex !== undefined && question.options ? question.options[studentAnswer.selectedOptionIndex] : 'NOT ANSWERED')
                              : (studentAnswer?.selectedAnswer !== undefined ? (studentAnswer.selectedAnswer ? 'TRUE' : 'FALSE') : 'NOT ANSWERED')
                            }
                          </p>
                        </div>

                        {!isCorrect && (
                          <div className="p-5 rounded-2xl border-2 bg-green-50/30 dark:bg-green-900/10 border-green-100 dark:border-green-900/30">
                            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Valid Response</p>
                            <p className="font-black text-lg text-green-700 dark:text-green-400">
                              {question.type === 'mcq' && question.options
                                ? (question.correctOptionIndex !== undefined ? question.options[question.correctOptionIndex] : 'N/A')
                                : (question.correctAnswer ? 'TRUE' : 'FALSE')
                              }
                            </p>
                          </div>
                        )}
                      </div>

                      {question.explanation && (
                        <div className="p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 relative">
                          <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <BrainCircuit className="w-3 h-3" /> Rationale
                          </p>
                          <p className="text-gray-700 dark:text-gray-300 text-sm font-medium leading-relaxed">
                            {question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {displayedCount < (result.questions || []).length && (
              <div ref={loadMoreRef} className="h-20 w-full" />
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default QuizResult;
