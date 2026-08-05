import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReports, dismissReport, actionReport, type ReportFilters } from '../services/AdminReportService';
import { toast } from 'sonner';
import { 
  AlertTriangle, 
  CheckCircle, 
  Shield, 
  Trash2, 
  RefreshCw, 
  MessageSquare, 
  BookOpen, 
  Video, 
  Filter, 
  Search, 
  Calendar, 
  ChevronDown,
  X,
  SortAsc,
  SortDesc,
  Eye
} from 'lucide-react';
import { AdminConfirmModal, Pagination } from '@/shared/ui';
import type { IReport } from '../types/IReport';

const ReportedContent: React.FC = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ReportFilters>({
    page: 1,
    limit: 12,
    status: 'pending',
    targetType: 'all',
    reason: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<IReport | null>(null);
  const [actionType, setActionType] = useState<'dismiss' | 'action' | null>(null);
  const [searchInput, setSearchInput] = useState('');

  useEffect(()=>{
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },[filters.page]) 

  // Debounce: only update filters.reason 500ms after the user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, reason: searchInput, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['adminReports', filters],
    queryFn: () => getReports(filters),
  });

  const dismissMutation = useMutation({
    mutationFn: dismissReport,
    onSuccess: () => {
      toast.success('Report dismissed successfully');
      queryClient.invalidateQueries({ queryKey: ['adminReports'] });
      setSelectedReport(null);
    },
    onError: () => toast.error('Failed to dismiss report')
  });

  const actionMutation = useMutation({
    mutationFn: actionReport,
    onSuccess: () => {
      toast.success('Action applied successfully');
      queryClient.invalidateQueries({ queryKey: ['adminReports'] });
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

  const handleFilterChange = (key: keyof ReportFilters, value: string | number) => {
    setFilters(prev => ({ 
      ...prev, 
      [key]: value, 
      page: key === 'page' ? value as number : 1 
    }));
  };

  const clearFilters = () => {
    setSearchInput('');
    setFilters({
      page: 1,
      limit: 12,
      status: 'pending',
      targetType: 'all',
      reason: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  const renderTargetIcon = (type: string) => {
    switch(type) {
      case 'course': return <BookOpen className="w-4 h-4 mr-1 text-blue-500" />;
      case 'lesson': return <Video className="w-4 h-4 mr-1 text-purple-500" />;
      case 'review': return <MessageSquare className="w-4 h-4 mr-1 text-orange-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900/50';
      case 'dismissed': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900/50';
      case 'actioned': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900/50';
      default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  if (isError) {
    return (
      <div className="p-6 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col justify-center items-center">
        <AlertTriangle className="text-red-500 w-12 h-12 mb-4" />
        <p className="text-red-500 font-semibold text-xl">Failed to load moderation data</p>
        <button onClick={() => refetch()} className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all">
          Try Again
        </button>
      </div>
    );
  }

  const reports = data?.reports || [];
  const totalReports = data?.total || 0;
  const totalPages = Math.ceil(totalReports / (filters.limit || 12));

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/30">
              <Shield className="text-white w-8 h-8" />
            </div>
            Moderation Center
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 ml-1">
            Manage platform integrity and process reported content
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center cursor-pointer gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 border ${
              isFilterOpen 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30' 
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-indigo-400'
            }`}
          >
            <Filter size={18} />
            Advanced Filters
            {isFilterOpen ? <X size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
          </button>
          
          <button
            onClick={() => { refetch(); toast.success("Refreshed"); }}
            className="p-2.5 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-700 transition-all cursor-pointer active:scale-95"
            title="Refresh Data"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Advanced Filter Panel */}
      {isFilterOpen && (
        <div className="mb-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Search Reason */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Search size={14} /> Search Reason
              </label>
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Search report reasons..."
                  className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all dark:text-white"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                {searchInput && (
                  <button
                    onClick={() => setSearchInput('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    title="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Status</label>
              <select 
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="dismissed">Dismissed</option>
                <option value="actioned">Actioned</option>
              </select>
            </div>

            {/* Target Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Content Type</label>
              <select 
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                value={filters.targetType}
                onChange={(e) => handleFilterChange('targetType', e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="course">Courses</option>
                <option value="lesson">Lessons</option>
                <option value="review">Reviews</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Calendar size={14} /> Date Range
              </label>
              <div className="flex items-center gap-2">
                <input 
                  type="date"
                  className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
                <span className="text-gray-400">-</span>
                <input 
                  type="date"
                  className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Sort By */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
                <select 
                  className="bg-transparent border-none text-sm font-semibold text-gray-700 dark:text-gray-200 focus:ring-0 cursor-pointer outline-none"
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  <option value="createdAt">Date Reported</option>
                  <option value="reason">Reason</option>
                  <option value="targetType">Content Type</option>
                </select>
              </div>

              <button 
                onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-300"
              >
                {filters.sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                {filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </button>
            </div>

            <button 
              onClick={clearFilters}
              className="text-sm font-bold cursor-pointer hover:border-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 p-1.5 rounded-xl text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
            >
              <RefreshCw size={14} /> Reset All Filters
            </button>
          </div>
        </div>
      )}

      {/* Content Stats Bar */}
      <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-2xl p-4 mb-8 flex justify-between items-center border border-white/20 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-bold uppercase tracking-wider">
            {totalReports} Total Reports Found
          </div>
          {filters.status !== 'all' && (
            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(filters.status!)}`}>
              Showing: {filters.status}
            </div>
          )}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Page {filters.page} of {totalPages || 1}
        </div>
      </div>

      {/* Main Content Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-3xl h-96 animate-pulse border border-gray-100 dark:border-gray-700 shadow-sm" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-3xl shadow-xl p-16 text-center border border-gray-100 dark:border-gray-700 max-w-2xl mx-auto mt-12 transform hover:scale-[1.01] transition-transform duration-500">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle size={48} className="drop-shadow-sm" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">All Caught Up!</h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
            There are no reports matching your current filter criteria. You've handled everything perfectly!
          </p>
          <button 
            onClick={clearFilters}
            className="mt-8 px-8 py-3 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 active:scale-95"
          >
            Show All Pending
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reports.map((report) => (
            <div 
              key={report._id} 
              className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-2 relative"
            >
              {/* Report Badge Overlay */}
              <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border z-10 ${getStatusColor(report.status)}`}>
                {report.status}
              </div>

              {/* Card Header */}
              <div className="p-6 pb-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gray-50 dark:bg-gray-900 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700 group-hover:scale-110 transition-transform duration-500">
                    {renderTargetIcon(report.targetType)}
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none mb-1">
                      Target Content
                    </h4>
                    <span className="text-sm font-bold text-gray-800 dark:text-white capitalize">
                      {report.targetType} Content
                    </span>
                  </div>
                </div>
                
                <div className="h-px bg-gradient-to-r from-transparent via-gray-100 dark:via-gray-700 to-transparent mb-4" />
              </div>

              {/* Card Body */}
              <div className="p-6 pt-0 flex-grow">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-[11px] font-black text-red-500 uppercase tracking-widest">Incident Reason</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-gray-900 dark:text-white leading-tight mb-3">
                    {report.reason}
                  </h3>
                  {report.description && (
                    <div className="relative group/desc">
                      <div className="absolute -left-3 top-0 bottom-0 w-1 bg-red-400/20 rounded-full" />
                      <p className="text-sm text-gray-600 dark:text-gray-300 italic leading-relaxed pl-2 line-clamp-3 group-hover/desc:line-clamp-none transition-all duration-300">
                        "{report.description}"
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl p-4 border border-gray-100/50 dark:border-gray-700/50 mb-6 group-hover:bg-indigo-50/30 dark:group-hover:bg-indigo-900/10 transition-colors duration-500">
                  <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2">Detailed Target Information</span>
                  {report.targetType !== 'review' && report.targetDetails?.title && (
                    <p className="font-bold text-gray-800 dark:text-gray-200 text-sm line-clamp-2">
                      {report.targetDetails.title}
                    </p>
                  )}
                  {report.targetType === 'review' && report.targetDetails && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < (report.targetDetails?.rating || 0) ? 'fill-current' : 'text-gray-300'}>★</span>
                          ))}
                        </div>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">({report.targetDetails.rating || 0})</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 italic line-clamp-2">
                        {report.targetDetails.comment ? `"${report.targetDetails.comment}"` : 'No written comment.'}
                      </p>
                    </div>
                  )}
                  {(!report.targetDetails || Object.keys(report.targetDetails).length === 0) && (
                    <div className="flex items-center gap-2 text-gray-400 italic text-xs">
                      <Eye size={14} />
                      Content metadata unavailable
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10">
                      {report.studentInfo?.profilePictureUrl ? (
                        <img 
                          src={report.studentInfo.profilePictureUrl} 
                          alt="" 
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-white dark:ring-gray-800"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-black shadow-lg"
                        style={{ display: report.studentInfo?.profilePictureUrl ? 'none' : 'flex' }}
                      >
                        {report.studentInfo?.name?.charAt(0) || 'U'}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none mb-1">Reported By</p>
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{report.studentInfo?.name || 'Anonymous'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none mb-1">Date</p>
                    <p className="text-sm font-bold text-gray-600 dark:text-gray-300">
                      {new Date(report.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Only show for pending */}
              {report.status === 'pending' && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800/90 border-t border-gray-100 dark:border-gray-700 flex gap-4 mt-auto">
                  <button
                    onClick={() => { setSelectedReport(report); setActionType('dismiss'); }}
                    className="flex-1 py-3 px-4 rounded-2xl font-bold text-sm text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <CheckCircle className="w-4 h-4 text-indigo-500" /> Dismiss
                  </button>
                  <button
                    onClick={() => { setSelectedReport(report); setActionType('action'); }}
                    className="flex-1 py-3 px-4 rounded-2xl font-bold text-sm bg-red-500 hover:bg-red-600 text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 hover:shadow-red-500/40 cursor-pointer active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" /> Take Action
                  </button>
                </div>
              )}
              
              {/* View History Button for handled reports */}
              {report.status !== 'pending' && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800/90 border-t border-gray-100 dark:border-gray-700 flex mt-auto">
                  <div className="w-full text-center text-xs font-bold text-gray-500 dark:text-gray-400 py-2">
                    Action handled on {new Date(report.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modern Pagination */}
      {totalPages > 1 && (
        <Pagination 
          page={filters.page || 1} 
          totalPages={totalPages} 
          onPageChange={(p) => handleFilterChange('page', p)} 
        />
      )}

      {/* Reusable Confirmation Modal */}
      <AdminConfirmModal
        isOpen={!!selectedReport}
        onClose={() => { setSelectedReport(null); setActionType(null); }}
        onConfirm={handleConfirm}
        title={actionType === 'dismiss' ? 'Dismiss Report?' : 'Process Action?'}
        description={
          actionType === 'dismiss' 
            ? "Are you sure you want to dismiss this report? The content will remain active on the platform and this report will be moved to archives."
            : `Are you sure you want to take action? This will ${selectedReport?.targetType === 'review' ? 'permanently delete the review' : `block the ${selectedReport?.targetType}`}. This action is irreversible.`
        }
        confirmText={actionType === 'dismiss' ? 'Yes, Dismiss Report' : 'Confirm Action'}
        cancelText="Cancel and Review Again"
        variant={actionType === 'dismiss' ? 'primary' : 'danger'}
        isLoading={dismissMutation.isPending || actionMutation.isPending}
        icon={actionType === 'dismiss' ? <CheckCircle size={32} /> : <Trash2 size={32} />}
      />
    </div>
  );
};

export default ReportedContent;
