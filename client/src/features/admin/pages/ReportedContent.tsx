import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPendingReports, dismissReport, actionReport } from '../services/AdminReportService';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle, Shield, Trash2, RefreshCw, MessageSquare, BookOpen, Video } from 'lucide-react';
import type { IReport } from '../types/IReport';

const ReportedContent: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState<IReport | null>(null);
  const [actionType, setActionType] = useState<'dismiss' | 'action' | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['adminReports', page],
    queryFn: () => getPendingReports(page, 12),
  });

  const dismissMutation = useMutation({
    mutationFn: dismissReport,
    onSuccess: (_, deletedId) => {
      toast.success('Report dismissed successfully');
      // Optimistically update the cache without triggering a new GET request
      queryClient.setQueryData(['adminReports', page], (oldData: {reports: IReport[], total: number}) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          total: oldData.total - 1,
          reports: oldData.reports.filter((r: IReport) => r._id !== deletedId)
        };
      });
      setSelectedReport(null);
    },
    onError: () => toast.error('Failed to dismiss report')
  });

  const actionMutation = useMutation({
    mutationFn: actionReport,
    onSuccess: (_, deletedId) => {
      toast.success('Action applied successfully');
      // Optimistically update the cache without triggering a new GET request
      queryClient.setQueryData(['adminReports', page], (oldData: {reports: IReport[], total: number}) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          total: oldData.total - 1,
          reports: oldData.reports.filter((r: IReport) => r._id !== deletedId)
        };
      });
      setSelectedReport(null);
    },
    onError: () => toast.error('Failed to apply action')
  });

  const handleConfirm = () => {
    if (!selectedReport) return;
    if (actionType === 'dismiss') {
      dismissMutation.mutate(selectedReport._id);
    } else if (actionType === 'action') {
      actionMutation.mutate(selectedReport._id);
    }
  };

  const renderTargetIcon = (type: string) => {
    switch(type) {
      case 'course': return <BookOpen className="w-4 h-4 mr-1 text-blue-500" />;
      case 'lesson': return <Video className="w-4 h-4 mr-1 text-purple-500" />;
      case 'review': return <MessageSquare className="w-4 h-4 mr-1 text-orange-500" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex justify-center items-center">
        <div className="animate-spin text-indigo-600"><RefreshCw size={32} /></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex justify-center items-center">
        <p className="text-red-500 font-semibold">Failed to load reported content.</p>
      </div>
    );
  }

  const reports = data?.reports || [];
  const totalPages = Math.ceil((data?.total || 0) / 12);

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2 flex items-center justify-center gap-3">
          <Shield className="text-indigo-600 w-10 h-10" />
          Moderation Queue
        </h1>
        <p className="text-gray-600 dark:text-gray-300">Review and action flagged content across the platform</p>
      </div>

      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-xl p-4 mb-6 flex justify-between items-center shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
          Showing pending reports ({data?.total || 0})
        </div>
        <button
          onClick={() => { refetch(); toast.success("Refreshed"); }}
          className="p-2 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm border border-gray-200 dark:border-gray-600 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center border border-gray-200 dark:border-gray-700">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">All Clear!</h2>
          <p className="text-gray-500 dark:text-gray-400">There are no pending reports in the moderation queue.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div key={report._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col transition-all hover:shadow-lg">
              
              {/* Header */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="bg-white dark:bg-gray-700 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider flex items-center border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200">
                    {renderTargetIcon(report.targetType)}
                    {report.targetType}
                  </div>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {new Date(report.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Body */}
              <div className="p-5 flex-grow">
                <div className="mb-4">
                  <span className="text-xs font-bold text-red-500 uppercase tracking-wider block mb-1">Reason for report</span>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {report.reason}
                  </h3>
                  {report.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                      "{report.description}"
                    </p>
                  )}
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-100 dark:border-gray-700 mb-4">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Target Content</span>
                  {report.targetType !== 'review' && report.targetDetails?.title && (
                    <p className="font-medium text-gray-800 dark:text-gray-200">{report.targetDetails.title}</p>
                  )}
                  {report.targetType === 'review' && report.targetDetails && (
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-yellow-500 font-bold mr-2">★ {report.targetDetails.rating || 0}</span>
                      {report.targetDetails.comment ? `"${report.targetDetails.comment}"` : <span className="italic text-gray-400">No written comment, rating only.</span>}
                    </div>
                  )}
                  {(!report.targetDetails || Object.keys(report.targetDetails).length === 0) && (
                    <p className="text-sm text-gray-400 italic">Content no longer available or couldn't be loaded.</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {report.studentInfo?.profilePictureUrl ? (
                    <img src={report.studentInfo.profilePictureUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 text-xs font-bold">
                      {report.studentInfo?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Reported by</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{report.studentInfo?.name || 'Unknown User'}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700 flex gap-3">
                <button
                  onClick={() => { setSelectedReport(report); setActionType('dismiss'); }}
                  className="flex-1 py-2 px-4 rounded-lg font-medium text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" /> Dismiss
                </button>
                <button
                  onClick={() => { setSelectedReport(report); setActionType('action'); }}
                  className="flex-1 py-2 px-4 rounded-lg font-medium text-sm bg-red-500 hover:bg-red-600 text-white transition-colors flex items-center justify-center gap-2 shadow-sm shadow-red-500/20 cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4" /> Take Action
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-50 cursor-pointer"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-600 dark:text-gray-300">Page {page} of {totalPages}</span>
          <button 
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-50 cursor-pointer"
          >
            Next
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              {actionType === 'dismiss' ? 'Dismiss Report?' : 'Take Action?'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {actionType === 'dismiss' 
                ? "Are you sure you want to dismiss this report? The content will remain active."
                : `Are you sure you want to take action? This will ${selectedReport.targetType === 'review' ? 'permanently delete the review' : `block the ${selectedReport.targetType}`}.`
              }
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setSelectedReport(null); setActionType(null); }}
                className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                disabled={dismissMutation.isPending || actionMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={dismissMutation.isPending || actionMutation.isPending}
                className={`px-4 py-2 rounded-lg font-medium text-white shadow-md transition-colors flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed ${
                  actionType === 'dismiss' 
                    ? 'bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600' 
                    : 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                }`}
              >
                {(dismissMutation.isPending || actionMutation.isPending) ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  actionType === 'dismiss' ? <CheckCircle className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />
                )}
                Confirm {actionType === 'dismiss' ? 'Dismissal' : 'Action'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportedContent;
