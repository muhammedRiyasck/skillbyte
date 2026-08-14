import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quizService } from '../../services/quizService';
import { 
  Users, 
  BarChart2, 
  ArrowLeft, 
  BrainCircuit, 
  TrendingUp, 
  RotateCcw, 
  ShieldCheck, 
  ChevronDown,
  ChevronUp,
  Clock,
  XCircle
} from 'lucide-react';
import Spiner from '@shared/ui/Spiner';
import { toast } from 'sonner';
import type { IStudentQuizSummary, IAttemptDetail } from '../../types/quiz.types';
import Pagination from '@shared/ui/Pagination';
import AdminConfirmModal from '@shared/ui/AdminConfirmModal';

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  colorClass: string;
  bgColorClass: string;
  detail?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, colorClass, bgColorClass, detail }) => (
  <div className="group bg-white dark:bg-gray-700 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-600 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all hover:-translate-y-1 cursor-pointer">
    <div className="flex flex-col gap-4">
      <div className={`w-14 h-14 ${bgColorClass} ${colorClass} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-4xl font-black text-gray-900 dark:text-white mt-1">{value}</p>
          {detail && <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{detail}</p>}
        </div>
      </div>
    </div>
  </div>
);

const QuizAnalytics: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [resetModalData, setResetModalData] = useState<{ isOpen: boolean; userId: string; name: string }>({
    isOpen: false,
    userId: '',
    name: ''
  });
  const itemsPerPage = 6;

  const { data: analytics, isLoading, isRefetching } = useQuery({
    queryKey: ['quizAnalytics', courseId, currentPage],
    queryFn: () => quizService.getAnalytics(courseId!, currentPage, itemsPerPage),
  });

  const resetMutation = useMutation({
    mutationFn: (userId: string) => quizService.resetAttempts(courseId!, userId),
    onSuccess: () => {
      toast.success('Student attempts reset successfully');
      queryClient.invalidateQueries({ queryKey: ['quizAnalytics', courseId] });
      setResetModalData({ isOpen: false, userId: '', name: '' });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || 'Failed to reset attempts';
      toast.error(errorMessage);
    }
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"><Spiner /></div>;

  const totalPages = analytics?.totalPages || 0;
  const paginatedAttempts = analytics?.studentAttempts || [];
  const passThreshold = analytics?.passPercentage ?? 60;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <button 
            onClick={() => navigate('/instructor/myCourses')}
            className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> My Courses
          </button>
          <span>/</span>
          <span className="font-medium text-gray-900 dark:text-white">Quiz Analytics</span>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-600 rounded-xl shadow-lg ">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Performance Insights</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Real-time stats from student assessment attempts</p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/instructor/quiz-config/${courseId}`)}
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm transition-all cursor-pointer"
          >
            Adjust Quiz Settings
          </button>
        </div>

        {!analytics || analytics.totalStudents === 0 ? (
          <div className="p-16 text-center bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-600">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
              <BrainCircuit className="text-gray-400 w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Awaiting Assessments</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto">
              Once students start completing your course and taking the quiz, their performance data will appear here.
            </p>
            <button 
              onClick={() => navigate(`/instructor/quiz-config/${courseId}`)}
              className="mt-8 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              Verify Quiz Settings
            </button>
          </div>
        ) : (
          <>
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                icon={Users}
                label="Students Participated"
                value={analytics.totalStudents}
                colorClass="text-indigo-600 dark:text-indigo-400"
                bgColorClass="bg-indigo-50 dark:bg-indigo-900/30"
              />

              <StatCard
                icon={ShieldCheck}
                label="Pass Rate"
                value={`${analytics.passRate}%`}
                colorClass="text-green-600 dark:text-green-400"
                bgColorClass="bg-green-50 dark:bg-green-900/30"
                detail={`(Min: ${analytics.passPercentage}%)`}
              />

              <StatCard
                icon={BarChart2}
                label="Average Mark"
                value={`${analytics.averageScore}%`}
                colorClass="text-purple-600 dark:text-purple-400"
                bgColorClass="bg-purple-50 dark:bg-purple-900/30"
              />
            </div>

            {/* Student Attempts Table */}
            <div className="bg-white dark:bg-gray-700 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-600 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-600 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Student Assessment Details</h2>
                <button
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['quizAnalytics', courseId] })}
                  className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all cursor-pointer group"
                  title="Refresh Data"
                >
                  <RotateCcw className={`w-5 h-5 transition-transform duration-500 ${isRefetching ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Student</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-center">Attempts</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-center">Best Score</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-center">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-600">
                    {paginatedAttempts.map((student: IStudentQuizSummary) => (
                      <React.Fragment key={student.userId}>
                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => setExpandedStudentId(expandedStudentId === student.userId ? null : student.userId)}
                                className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors text-gray-500 dark:text-gray-400 cursor-pointer"
                              >
                                {expandedStudentId === student.userId ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400">
                                {student.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 dark:text-white">{student.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{student.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center font-medium text-gray-700 dark:text-gray-300">
                            {student.attemptsCount}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`text-lg font-black ${student.bestScore >= passThreshold ? 'text-green-600' : 'text-amber-600'}`}>
                              {student.bestScore}%
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center">
                              {student.overallStatus === 'PASSED' ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-bold">
                                  <ShieldCheck className="w-3 h-3" /> PASSED
                                </span>
                              ) : student.overallStatus === 'FAILED' ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-bold">
                                  <XCircle className="w-3 h-3" /> FAILED
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-bold">
                                  <Clock className="w-3 h-3" /> IN PROGRESS
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => setResetModalData({ isOpen: true, userId: student.userId, name: student.name })}
                              disabled={resetMutation.isPending}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-all font-bold text-sm disabled:opacity-50 cursor-pointer group"
                            >
                              <RotateCcw className={`w-4 h-4 group-hover:rotate-[-45deg] transition-transform ${resetMutation.isPending && resetMutation.variables === student.userId ? 'animate-spin' : ''}`} />
                              Reset Attempts
                            </button>
                          </td>
                        </tr>
                        {expandedStudentId === student.userId && (
                          <tr className="bg-indigo-50/20 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-600">
                            <td colSpan={5} className="px-12 py-4">
                              <div className="rounded-xl border border-indigo-100 dark:border-gray-600 overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
                                <table className="w-full text-sm">
                                  <thead className="bg-indigo-50/50 dark:bg-gray-700/50 text-indigo-900 dark:text-gray-300">
                                    <tr>
                                      <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider text-left">Attempt No.</th>
                                      <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider text-center">Score</th>
                                      <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider text-center">Correct Answers</th>
                                      <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider text-center">Status</th>
                                      <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider text-right">Date Started</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {student.attempts?.map((attempt: IAttemptDetail) => (
                                      <tr key={attempt.attemptNumber} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-4 py-3 font-bold text-gray-900 dark:text-gray-200">Attempt #{attempt.attemptNumber}</td>
                                        <td className="px-4 py-3 text-center">
                                          <span className={`font-black ${attempt.score >= passThreshold ? 'text-green-600' : 'text-red-600'}`}>{attempt.score}%</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                          <span className="font-bold text-indigo-600 dark:text-indigo-400">{attempt.correctAnswersCount} / {attempt.totalQuestions}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                          {attempt.passed ? (
                                            <span className="inline-flex px-2 py-0.5 rounded-md bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-bold text-[10px] uppercase tracking-wider">PASSED</span>
                                          ) : attempt.status === 'in_progress' ? (
                                            <span className="inline-flex px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-bold text-[10px] uppercase tracking-wider">IN PROGRESS</span>
                                          ) : (
                                            <span className="inline-flex px-2 py-0.5 rounded-md bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-bold text-[10px] uppercase tracking-wider">FAILED</span>
                                          )}
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400 text-xs font-medium">
                                          {new Date(attempt.startedAt).toLocaleString()}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-gray-100 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/30">
                  <Pagination 
                    page={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={setCurrentPage} 
                  />
                  <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Showing students <span className="font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold">{Math.min(currentPage * itemsPerPage, analytics!.totalStudents)}</span> of <span className="font-bold">{analytics!.totalStudents}</span>
                  </p>
                </div>
              )}
            </div>
          </>
        )}
        
        {/* Decorative background element */}
        <div className="fixed -bottom-24 -right-24 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed -top-24 -left-24 w-96 h-96 rounded-full blur-3xl pointer-events-none" />
      </div>

      <AdminConfirmModal
        isOpen={resetModalData.isOpen}
        onClose={() => setResetModalData({ isOpen: false, userId: '', name: '' })}
        onConfirm={() => resetMutation.mutate(resetModalData.userId)}
        title="Reset Student Attempts"
        description={`Are you sure you want to reset attempts for ${resetModalData.name}? This will allow them to retake the quiz from scratch and all previous scores for this course will be cleared.`}
        confirmText="Reset Now"
        cancelText="Keep Attempts"
        variant="warning"
        isLoading={resetMutation.isPending}
        icon={<RotateCcw className="w-8 h-8" />}
      />
    </div>
  );
};

export default QuizAnalytics;
