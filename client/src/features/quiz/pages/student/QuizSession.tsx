import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { quizService } from '../../services/quizService';
import { ROUTES } from '../../../../core/router/paths';
import Spiner from '@shared/ui/Spiner';
import Modal from '@shared/ui/Modal';
import { ChevronLeft, ChevronRight, Send, HelpCircle, BrainCircuit, ArrowLeft, Settings, Code2, Timer } from 'lucide-react';
import type { IAnswer, QuestionType } from '../../types/quiz.types';
import { useQuizTimer } from '../../components/student/useQuizTimer';

import QuestionRenderer from '../../components/student/QuestionRenderer';

const QuizSession: React.FC = () => {
  const { courseId, attemptId } = useParams<{ courseId: string; attemptId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<IAnswer[]>(() => {
    if (attemptId) {
      const stored = localStorage.getItem(`quiz_answers_${attemptId}`);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error('Failed to parse cached quiz answers', e);
        }
      }
    }
    return [];
  });
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const { data: attempt, isLoading } = useQuery({
    queryKey: ['quizResult', courseId],
    queryFn: () => quizService.getResult(courseId!),
    retry: false,
  });

  const { data: config } = useQuery({
    queryKey: ['quizConfig', courseId],
    queryFn: () => quizService.getConfig(courseId!),
    retry: false,
    enabled: !!courseId,
  });

  const { formattedTime, isExpired, isWarning, isCritical } = useQuizTimer({
    startedAt: attempt?.startedAt ?? new Date().toISOString(),
    timeLimitMinutes: config?.timeLimit ?? null,
  });

  const submitMutation = useMutation({
    mutationFn: () => quizService.submitAttempt(attemptId!, answers),
    onSuccess: (data) => {
      // Update the cache immediately so QuizResult doesn't see stale 'IN_PROGRESS' data
      queryClient.setQueryData(['quizResult', courseId], data);

      // Clear local storage on success
      localStorage.removeItem(`quiz_answers_${attemptId}`);

      toast.success('Quiz submitted successfully!');
      navigate(ROUTES.student.quiz.result.replace(':courseId', courseId!));
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || 'Failed to submit quiz';
      toast.error(errorMessage);
    }
  });
  // Scroll to top when navigating questions
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentQuestionIndex]);

  // Save answers to local storage whenever they change
  useEffect(() => {
    if (attemptId && answers.length > 0) {
      localStorage.setItem(`quiz_answers_${attemptId}`, JSON.stringify(answers));
    }
  }, [answers, attemptId]);

  // Redirect if already completed or timed out
  useEffect(() => {
    if (attempt && (attempt.status === 'completed' || attempt.status === 'timed_out')) {
      navigate(ROUTES.student.quiz.result.replace(':courseId', courseId!));
    }
  }, [attempt, courseId, navigate]);

  // Track whether auto-submit has already fired (prevent double-submit)
  const autoSubmittedRef = useRef(false);

  // Auto-submit when timer expires
  useEffect(() => {
    if (isExpired && !submitMutation.isPending && !autoSubmittedRef.current) {
      autoSubmittedRef.current = true;
      toast.warning('⏰ Time is up! Submitting your quiz automatically...');
      submitMutation.mutate();
    }
  }, [isExpired, submitMutation]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-800"><Spiner /></div>;

  if (!attempt || !attempt.questions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-800 p-6">
        <div className="max-w-md w-full text-center bg-white dark:bg-gray-700 rounded-3xl shadow-xl p-10 border border-gray-100 dark:border-gray-600">
          <HelpCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Session Unavailable</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">We encountered an issue loading your quiz questions. Please return to the course page.</p>
          <button
            onClick={() => navigate(ROUTES.course.details.replace(':id', courseId!))}
            className="mt-8 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  const questions = attempt.questions;
  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers.find(a => a.questionId === currentQuestion.questionId);

  const handleOptionSelect = (optionIndex: number) => {
    const newAnswer: IAnswer = {
      questionId: currentQuestion.questionId,
      type: 'mcq' as QuestionType,
      selectedOptionIndex: optionIndex
    };

    setAnswers(prev => {
      const existing = prev.findIndex(a => a.questionId === currentQuestion.questionId);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = newAnswer;
        return next;
      }
      return [...prev, newAnswer];
    });
  };

  const handleTrueFalseSelect = (value: boolean) => {
    const newAnswer: IAnswer = {
      questionId: currentQuestion.questionId,
      type: 'true_false' as QuestionType,
      selectedAnswer: value
    };

    setAnswers(prev => {
      const existing = prev.findIndex(a => a.questionId === currentQuestion.questionId);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = newAnswer;
        return next;
      }
      return [...prev, newAnswer];
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitClick = () => {
    if (answers.length < questions.length) {
      setIsSubmitModalOpen(true);
    } else {
      submitMutation.mutate();
    }
  };

  const handleConfirmSubmit = () => {
    setIsSubmitModalOpen(false);
    submitMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 pb-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-4 md:pb-8 space-y-10">
        {/* Sticky Top Area */}
        <div className="sticky top-0 z-40 bg-gray-50 dark:bg-gray-800 pt-4 md:pt-8 pb-4 space-y-10 -mx-4 px-4 md:-mx-8 md:px-8">
          {/* Breadcrumbs / Back button */}
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <button
              onClick={() => navigate(ROUTES.course.details.replace(':id', courseId!))}
              className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Course
            </button>
            <span>/</span>
            <span className="font-medium text-gray-900 dark:text-white">Quiz Settings</span>
          </div>

          <div className="sticky top-5 z-50 bg-gray-50/95 dark:bg-gray-800/95 backdrop-blur-md pt-10 pb-4 !mt-0 -mx-4 px-4 md:-mx-8 md:px-8 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-600 rounded-xl shadow-lg">
                <BrainCircuit className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Active Assessment</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Session in Progress</p>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold  dark:text-white uppercase">Question Progress</p>
                <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 text-center">
                  {currentQuestionIndex + 1} <span className="text-gray-300 dark:text-gray-600 text-sm">/</span> {questions.length}
                </p>
              </div>
              {formattedTime !== null && (
                <div
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm tabular-nums border transition-all shadow-sm ${isCritical
                    ? 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 animate-pulse shadow-red-500/20'
                    : isWarning
                      ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400'
                      : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'
                    }`}
                >
                  <Timer className="w-4 h-4 shrink-0" />
                  {formattedTime}
                </div>
              )}

              <button
                onClick={handleSubmitClick}
                disabled={submitMutation.isPending || isExpired}
                className="px-5 py-2.5 text-sm font-semibold text-indigo-600 bg-white dark:bg-gray-700 border border-indigo-100 dark:border-gray-600 rounded-xl hover:bg-indigo-50 dark:hover:bg-gray-600 shadow-sm transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {submitMutation.isPending ? 'Submitting...' : 'Submit Quiz'}
              </button>
            </div>
          </div>


          {/* Progress Tracker — segmented question dots */}
          <div className="w-full bg-white dark:bg-gray-700/60 rounded-2xl border border-gray-100 dark:border-gray-600 px-6 py-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
              </div>

              {/* Right side stats stack */}
              <div className="flex flex-col items-end gap-2">
                {/* Countdown Timer Badge */}


                <div className="flex items-center gap-3 text-xs font-bold">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    {answers.length} Answered
                  </span>
                  <span className="flex items-center gap-1 text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 inline-block" />
                    {questions.length - answers.length} Remaining
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {questions.map((_, idx) => {
                const isAnswered = answers.some((a) => a.questionId === questions[idx].questionId);
                const isActive = currentQuestionIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    title={`Question ${idx + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer flex-1 min-w-[8px] ${isActive
                      ? 'bg-indigo-600 shadow-md shadow-indigo-600/30 scale-y-150'
                      : isAnswered
                        ? 'bg-emerald-400 dark:bg-emerald-500'
                        : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'
                      }`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-700 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-600 overflow-hidden">

          <div className="p-8 md:p-14 space-y-12">
            {/* Question Area */}
            <div className="relative z-10 space-y-6">
              <div className="space-y-8">
                <div className="flex items-center gap-2 opacity-60">
                  <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-widest">Question {currentQuestionIndex + 1}</h3>
                </div>

                <div className="bg-indigo-50/30 dark:bg-indigo-900/10 p-6 md:p-12 rounded-[2.5rem] border border-indigo-100/50 dark:border-indigo-900/20 shadow-inner">
                  <QuestionRenderer text={currentQuestion.questionText} />
                  <p className="text-[10px] text-indigo-400 dark:text-indigo-500 mt-8 font-black uppercase tracking-[0.2em] opacity-50 flex items-center gap-2">
                    <Code2 className="w-3 h-3" />
                    {currentQuestion.type === 'mcq' ? 'Multiple Choice' : 'True/False Verification'}
                  </p>
                </div>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 gap-4 pt-4">
                {currentQuestion.type === 'mcq' && currentQuestion.options?.map((option: string, index: number) => {
                  const isSelected = currentAnswer?.selectedOptionIndex === index;
                  return (
                    <button
                      key={index}
                      onClick={() => handleOptionSelect(index)}
                      className={`group w-full text-left p-4 md:p-5 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 cursor-pointer ${isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/30 text-indigo-900 dark:text-white shadow-md'
                        : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-500/50 text-gray-700 dark:text-gray-300'
                        }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border-2 font-bold transition-all shrink-0 ${isSelected
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-400 group-hover:border-indigo-400'
                        }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="font-semibold text-base md:text-lg">{option}</span>
                    </button>
                  );
                })}

                {currentQuestion.type === 'true_false' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <button
                      onClick={() => handleTrueFalseSelect(true)}
                      className={`group p-8 rounded-2xl border-2 text-center transition-all duration-200 cursor-pointer ${currentAnswer?.selectedAnswer === true
                        ? 'border-green-600 bg-green-50/50 dark:bg-green-900/20 text-green-900 dark:text-white shadow-md scale-[1.02]'
                        : 'border-gray-100 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/40 hover:border-green-300 text-gray-600 dark:text-gray-400'
                        }`}
                    >
                      <span className="font-bold text-2xl block mb-1">TRUE</span>
                      <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Affirmative</p>
                    </button>
                    <button
                      onClick={() => handleTrueFalseSelect(false)}
                      className={`group p-8 rounded-2xl border-2 text-center transition-all duration-200 cursor-pointer ${currentAnswer?.selectedAnswer === false
                        ? 'border-red-600 bg-red-50/50 dark:bg-red-900/20 text-red-900 dark:text-white shadow-md scale-[1.02]'
                        : 'border-gray-100 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/40 hover:border-red-300 text-gray-600 dark:text-gray-400'
                        }`}
                    >
                      <span className="font-bold text-2xl block mb-1">FALSE</span>
                      <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Negative</p>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="pt-8 border-t border-gray-100 dark:border-gray-600 flex justify-between items-center gap-6">
              <button
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-4 flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" /> PREVIOUS
              </button>

              <div>
                {currentQuestionIndex === questions.length - 1 ? (
                  <button
                    onClick={handleSubmitClick}
                    className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                  >
                    FINISH & SUBMIT
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    NEXT QUESTION <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Confirm Submission"
        onConfirm={handleConfirmSubmit}
        confirmLabel="Submit Quiz"
        cancelLabel="Continue Quiz"
      >
        <div className="text-gray-700 dark:text-gray-300">
          <p className="mb-4 text-lg font-medium text-amber-600 dark:text-amber-400">
            ⚠️ Incomplete Quiz
          </p>
          <p>
            You have only answered <span className="font-bold">{answers.length}</span> out of <span className="font-bold">{questions.length}</span> questions.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Are you sure you want to submit your attempt? You won't be able to change your answers later.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default QuizSession;
