import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { quizService } from '../../services/quizService';
import { AlertCircle, Clock, BrainCircuit, Sparkles, RefreshCw, ChevronRight } from 'lucide-react';
import { ROUTES } from '../../../../core/router/paths';
import Spiner from '@shared/ui/Spiner';
import type { IQuizConfig } from '../../types/quiz.types';

const QuizLanding: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showSafetyStart, setShowSafetyStart] = React.useState(false);

  const { data: previousResult, isLoading: isResultLoading } = useQuery({
    queryKey: ['quizResult', courseId],
    queryFn: () => quizService.getResult(courseId!),
    retry: false,
  });

  const { data: config, isLoading: isConfigLoading } = useQuery({
    queryKey: ['quizConfig', courseId],
    queryFn: () => quizService.getConfig(courseId!),
    retry: false,
    refetchInterval: (query) => {
      const data = query.state.data as IQuizConfig;
      if (!data) return false;
      return data.isPoolGenerationPending ? 3000 : false;
    }
  });

  const startMutation = useMutation({
    mutationFn: () => quizService.startAttempt(courseId!),
    onSuccess: (data) => {
      // Overwrite the cache so the session page sees the new IN_PROGRESS attempt immediately
      queryClient.setQueryData(['quizResult', courseId], data);
      toast.success('Quiz started! Good luck.');
      const id = (data.attemptId || data._id || data.id) as string;
      navigate(ROUTES.student.quiz.session.replace(':courseId', courseId!).replace(':attemptId', id));
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || 'Failed to start quiz. Check course completion.';
      toast.error(errorMessage);
    }
  });

  const attemptCount = previousResult ? previousResult.attemptNumber : 0;
  const canStart = config ? attemptCount < config.maxAttempts : false;
  const isPoolPreparing = config && canStart && config.isPoolGenerationPending;
  const questionsToPass = config ? Math.ceil((config.passPercentage / 100) * config.questionCount) : 0;
  const isCurrentlyInProgress = previousResult && previousResult.status === 'in_progress';

  useEffect(()=>{
    window.scrollTo({top:0,behavior:'smooth'});
  },[])

  // Safety: If it takes too long (e.g. background task failed), let them start anyway
  useEffect(() => {
    if (isPoolPreparing) {
      const timer = setTimeout(() => setShowSafetyStart(true), 20000); // 20s safety window
      return () => clearTimeout(timer);
    }
    setShowSafetyStart(false);
    return undefined;
  }, [isPoolPreparing]);

  if (isConfigLoading || isResultLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-800"><Spiner /></div>;
  }

  if (!config || !config.isEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-800 p-6">
        <div className="max-w-md w-full text-center bg-white dark:bg-gray-700 rounded-3xl shadow-xl p-10 border border-gray-100 dark:border-gray-600">
          <AlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quiz Unavailable</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">The instructor has not enabled a quiz for this course yet.</p>
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-sans transition-colors duration-500">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 dark:bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 dark:bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />

      <div className="max-w-4xl w-full grid lg:grid-cols-5 gap-0 bg-white dark:bg-gray-900/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10 relative z-10">
        
        {/* Left Side: Hero & Branding */}
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-purple-700 p-8 md:p-12 flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          </div>
          
          <div className="relative">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl border border-white/30 transform hover:rotate-6 transition-transform duration-500">
              <BrainCircuit className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 bg-yellow-400 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-1 shadow-lg">
              <Sparkles className="w-3 h-3" /> AI Powered
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 leading-none text-white">
            FINAL<br />ASSESSMENT
          </h1>
          <p className="text-indigo-100/80 text-sm font-medium leading-relaxed max-w-[200px]">
            Master the core concepts and earn your recognition.
          </p>

          <div className="mt-12 flex flex-col gap-3 w-full max-w-[200px]">
             <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                <p className="text-[10px] uppercase font-bold text-indigo-200 mb-1 text-center">Pass Requirement</p>
                <div className="flex flex-col items-center">
                  <p className="text-xl font-black text-white">{config.passPercentage}%</p>
                  <p className="text-[9px] font-bold text-indigo-100 opacity-70 uppercase tracking-tighter">({questionsToPass} Correct Answers)</p>
                </div>
             </div>
             <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                <p className="text-[10px] uppercase font-bold text-indigo-200 mb-1 text-center">Time Limit</p>
                <p className="text-xl font-black text-white text-center">
                  {config.timeLimit ? `${config.timeLimit} Mins` : `~${config.questionCount * 2} Mins`}
                </p>
             </div>
          </div>
        </div>

        {/* Right Side: Details & Action */}
        <div className="lg:col-span-3 p-8 md:p-12 flex flex-col bg-white dark:bg-transparent">
          <div className="flex-1 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Quiz Overview</h2>
                <p className="text-slate-500 dark:text-gray-400 text-sm">Review the protocols before starting.</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase">Attempts Used</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">{attemptCount} / {config.maxAttempts}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/5">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase mb-1">Questions</p>
                  <div className="flex items-baseline gap-1.5">
                    <p className="text-lg font-black text-slate-900 dark:text-white">{config.questionCount} Items</p>
                    <p className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase">({questionsToPass} to pass)</p>
                  </div>
               </div>
               <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/5">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase mb-1">Complexity</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white capitalize">{config.difficulty}</p>
               </div>
            </div>

            {/* Focus Topics Section */}
            <div className="space-y-3">
              <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Focus Topics</p>
              <div className="flex flex-wrap gap-2">
                {config.topics.map((topic, index) => (
                  <span 
                    key={index}
                    className="px-4 py-2 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold border border-slate-100 dark:border-white/10 flex items-center gap-2"
                  >
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                Examination Protocols
              </h3>
              
              <div className="space-y-3">
                <div className="group flex gap-4 p-4 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-2xl border border-slate-100 dark:border-white/5 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">AI-Powered Evaluation</p>
                    <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">Dynamic assessments generated uniquely for every student to ensure academic integrity.</p>
                  </div>
                </div>

                <div className="group flex gap-4 p-4 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-2xl border border-slate-100 dark:border-white/5 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">Automatic Submission</p>
                    <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">Your quiz will be automatically submitted when the time limit expires, ensuring your progress is safely recorded.</p>
                  </div>
                </div>

                {/* <div className="group flex gap-4 p-4 bg-emerald-500/5 hover:bg-emerald-500/10 rounded-2xl border border-emerald-500/10 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-0.5">Academic Integrity</p>
                    <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">This is a self-assessment for your growth. Cheating robs you of the chance to truly master the content.</p>
                  </div>
                </div> */}

                <div className="group flex gap-4 p-4 bg-orange-500/5 hover:bg-orange-500/10 rounded-2xl border border-orange-500/10 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-orange-600 dark:text-orange-400 mb-0.5">Test Yourself</p>
                    <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">Treat this quiz as a mirror. Be honest with yourself and use the results to identify your weak spots.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10">
            {previousResult && previousResult.passed && (
              <div className="mb-6 p-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20 text-center font-bold text-sm flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                Assessment Cleared: {previousResult.score}%
              </div>
            )}

            <div className="space-y-4">
              {isCurrentlyInProgress ? (
                <button
                  onClick={() => {
                    const id = (previousResult.attemptId || previousResult._id || previousResult.id) as string;
                    navigate(ROUTES.student.quiz.session.replace(':courseId', courseId!).replace(':attemptId', id));
                  }}
                  className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 hover:-translate-y-1 transition-all active:translate-y-0 cursor-pointer flex items-center justify-center gap-3 group"
                >
                  RESUME ASSESSMENT
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : canStart ? (
                <button
                  onClick={() => startMutation.mutate()}
                  disabled={startMutation.isPending || (isPoolPreparing && !showSafetyStart)}
                  className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-black font-black rounded-2xl shadow-xl hover:bg-slate-800 dark:hover:bg-indigo-50 hover:-translate-y-1 transition-all active:translate-y-0 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-3 group"
                >
                  {startMutation.isPending || (isPoolPreparing && !showSafetyStart) ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      {isPoolPreparing ? 'AI IS PREPARING QUESTIONS...' : 'PREPARING ASSESSMENT...'}
                    </>
                  ) : (
                    <>
                      {isPoolPreparing ? 'START (ON-DEMAND GENERATION)' : 'START ASSESSMENT'}
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              ) : (
                <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-[2rem] text-center">
                  <p className="text-red-500 font-bold text-sm">Attempt Limit Reached</p>
                  <p className="text-gray-500 text-xs mt-1">You have exhausted all allowed attempts for this final assessment.</p>
                  <p className="text-gray-500 text-xs mt-1">if you have any concerns, contact your instructor</p>
                </div>
              )}
              
              {previousResult && (
                <button
                  onClick={() => navigate(ROUTES.student.quiz.result.replace(':courseId', courseId!))}
                  className="w-full py-4 bg-transparent border-2 border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  VIEW PAST RESULTS
                </button>
              )}

              <p className="text-center text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-2">
                Protected by Skillbyte AI Engine v2.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizLanding;
