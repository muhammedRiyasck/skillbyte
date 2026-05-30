import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { quizService } from '../../services/quizService';
import type { IQuizConfig, QuestionType, QuizDifficulty } from '../../types/quiz.types';
import Spiner from '@shared/ui/Spiner';
import { ArrowLeft, Settings, BrainCircuit, Plus, X } from 'lucide-react';

const QuizConfig: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<Partial<IQuizConfig>>({
    courseId: courseId || '',
    isEnabled: false,
    topics: [],
    questionCount: 10,
    questionTypes: ['mcq'],
    difficulty: 'mixed',
    passPercentage: 60,
    maxAttempts: 1,
    timeLimit: null,
  });

  const [topicInput, setTopicInput] = useState('');

  const { data: config, isLoading } = useQuery({
    queryKey: ['quizConfig', courseId],
    queryFn: () => quizService.getConfig(courseId!),
    retry: false,
  });

  useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  const saveMutation = useMutation({
    mutationFn: (data: Partial<IQuizConfig>) => {
      if (config?.configId) {
        return quizService.updateConfig(courseId!, data);
      }
      return quizService.createConfig({ ...data, courseId: courseId! });
    },
    onSuccess: () => {
      toast.success('Quiz configuration saved successfully');
      queryClient.invalidateQueries({ queryKey: ['quizConfig', courseId] });
      navigate('/instructor/myCourses');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || 'Failed to save configuration';
      toast.error(errorMessage);
    },
  });

  const handleAddTopic = () => {
    if (topicInput.trim()) {
      if (formData.topics && formData.topics.length >= 3) {
        toast.error('Maximum of 3 topics allowed to keep the quiz focused.');
        return;
      }
      if (formData.topics?.includes(topicInput.trim())) {
        toast.error('This topic is already added.');
        return;
      }
      setFormData({
        ...formData,
        topics: [...(formData.topics || []), topicInput.trim()],
      });
      setTopicInput('');
    }
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    setFormData({
      ...formData,
      topics: formData.topics?.filter(t => t !== topicToRemove) || [],
    });
  };

  const toggleQuestionType = (type: QuestionType) => {
    const currentTypes = formData.questionTypes || [];
    if (currentTypes.includes(type)) {
      if (currentTypes.length > 1) {
        setFormData({ ...formData, questionTypes: currentTypes.filter(t => t !== type) });
      } else {
        toast.error('At least one question type must be selected');
      }
    } else {
      setFormData({ ...formData, questionTypes: [...currentTypes, type] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.topics || formData.topics.length === 0) {
      toast.error('Please add at least one topic');
      return;
    }
    saveMutation.mutate(formData);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-800"><Spiner /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">

        {/* Breadcrumbs / Back button */}
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <button
            onClick={() => navigate('/instructor/myCourses')}
            className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> My Courses
          </button>
          <span>/</span>
          <span className="font-medium text-gray-900 dark:text-white">Quiz Settings</span>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 rounded-xl shadow-lg">
              <BrainCircuit className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Quiz Configuration</h1>
                {formData.isEnabled ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-black uppercase tracking-wider border border-green-200 dark:border-green-800/50">
                    Live
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] font-black uppercase tracking-wider border border-gray-200 dark:border-gray-700">
                    Disabled
                  </span>
                )}
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Automate final assessments using Gemini AI</p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/instructor/quiz-analytics/${courseId}`)}
            className="px-5 py-2.5 text-sm font-semibold dark:text-white bg-white dark:bg-gray-700 border border-indigo-100 dark:border-gray-600 rounded-xl hover:bg-indigo-50 dark:hover:bg-gray-600 shadow-sm transition-all cursor-pointer"
          >
            View Student Analytics
          </button>
        </div>

        <div className="bg-white dark:bg-gray-700 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-600 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-10">

            {/* Enable/Disable Toggle */}
            <div className={`flex items-center justify-between p-6 rounded-2xl border transition-all duration-500 ${formData.isEnabled
                ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-900/30'
                : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700'
              }`}>
              <div className="max-w-[70%]">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Enable Assessment</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {formData.isEnabled
                    ? 'Students who complete 100% of the course content will be prompted to take this quiz.'
                    : 'The quiz is currently hidden from students. You can still configure settings below.'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer scale-125">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.isEnabled || false}
                  onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                />
                <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="space-y-10">

              {/* Topics Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Focus Areas & Topics</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Specify what the AI should quiz students on. Max 3 specific topics.</p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={topicInput}
                    maxLength={50}
                    onChange={(e) => setTopicInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTopic())}
                    className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none text-gray-900 dark:text-white transition-all"
                    placeholder="e.g. React Hooks (max 50 chars)"
                  />
                  <button
                    type="button"
                    onClick={handleAddTopic}
                    className="px-6 py-3 bg-gray-900 dark:bg-indigo-600 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-indigo-700 transition-colors flex items-center gap-2 font-bold cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {formData.topics?.map(topic => (
                    <span key={topic} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-xl text-sm font-semibold border border-indigo-100 dark:border-indigo-800">
                      {topic}
                      <button type="button" onClick={() => handleRemoveTopic(topic)} className="hover:text-red-500 transition-colors cursor-pointer">
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                  {(!formData.topics || formData.topics.length === 0) && (
                    <p className="text-sm text-red-500 font-medium animate-pulse">Required: Add at least one topic for AI context.</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Question Count */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Question Volume (Max 15)</label>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-600 flex items-center gap-6">
                    <input
                      type="range"
                      min="5" max="15" step="1"
                      value={formData.questionCount || 10}
                      onChange={(e) => setFormData({ ...formData, questionCount: Number(e.target.value) })}
                      className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="w-16 text-center">
                      <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{formData.questionCount}</span>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Items</p>
                    </div>
                  </div>
                </div>

                {/* Pass Percentage */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Minimum Pass Score (%)</label>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-600 flex items-center gap-6">
                    <input
                      type="range"
                      min="40" max="100" step="5"
                      value={formData.passPercentage || 60}
                      onChange={(e) => setFormData({ ...formData, passPercentage: Number(e.target.value) })}
                      className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="w-16 text-center">
                      <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{formData.passPercentage}%</span>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Goal</p>
                    </div>
                  </div>
                </div>

                {/* Difficulty */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Intelligence Complexity</label>
                  <select
                    value={formData.difficulty || 'mixed'}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as QuizDifficulty })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-gray-900 dark:text-white font-medium cursor-pointer"
                  >
                    <option value="easy">Beginner Friendly (Easy)</option>
                    <option value="medium">Standard Assessment (Medium)</option>
                    <option value="hard">Advanced Expert (Hard)</option>
                    <option value="mixed">Dynamic/Varied (Mixed)</option>
                  </select>
                </div>

                {/* Max Attempts */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Allow Retakes (Max 2)</label>
                  <select
                    value={formData.maxAttempts || 1}
                    onChange={(e) => setFormData({ ...formData, maxAttempts: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-gray-900 dark:text-white font-medium cursor-pointer"
                  >
                    {[1, 2].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Attempt Only' : 'Total Attempts'}</option>
                    ))}
                  </select>
                </div>

                {/* Time Limit */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Time Limit</label>
                  <select
                    value={formData.timeLimit === null ? 'null' : formData.timeLimit}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({ ...formData, timeLimit: val === 'null' ? null : Number(val) });
                    }}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-gray-900 dark:text-white font-medium cursor-pointer"
                  >
                    <option value="null">Unlimited Time</option>
                    {[5, 10, 15, 30, 60].map(time => (
                      <option key={time} value={time}>{time} Minutes</option>
                    ))}
                  </select>
                </div>

                {/* Question Types */}
                <div className="col-span-full space-y-4">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Allowed Question Formats</label>
                  <div className="flex flex-wrap gap-4">
                    <label className={`flex-1 min-w-[150px] p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-center gap-3 ${formData.questionTypes?.includes('mcq')
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                      <input
                        type="checkbox"
                        checked={formData.questionTypes?.includes('mcq')}
                        onChange={() => toggleQuestionType('mcq')}
                        className="sr-only"
                      />
                      <span className="font-bold">Multiple Choice</span>
                    </label>
                    <label className={`flex-1 min-w-[150px] p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-center gap-3 ${formData.questionTypes?.includes('true_false')
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                      <input
                        type="checkbox"
                        checked={formData.questionTypes?.includes('true_false')}
                        onChange={() => toggleQuestionType('true_false')}
                        className="sr-only"
                      />
                      <span className="font-bold">True / False</span>
                    </label>
                  </div>
                </div>
              </div>

              {config?.hasCachedQuestions && formData.maxAttempts === 1 && (
                <div className="p-5 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 rounded-2xl border border-amber-200 dark:border-amber-900/40 text-sm flex gap-3">
                  <div className="shrink-0 p-1 bg-amber-200 dark:bg-amber-800 rounded-full h-fit">
                    <Settings className="w-4 h-4" />
                  </div>
                  <p>
                    <span className="font-bold uppercase text-[11px] block mb-1">Cache Active</span>
                    AI has already generated a set of questions for this configuration. Modifying core parameters (Topics, Count, Difficulty) will clear this cache and regenerate questions for the next student.
                  </p>
                </div>
              )}

            </div>

            <div className="pt-8 border-t border-gray-100 dark:border-gray-600 flex justify-end">
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {saveMutation.isPending ? 'Applying Changes...' : 'Apply Configuration'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuizConfig;
