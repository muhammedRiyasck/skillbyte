import React, { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RefreshCw, CheckCircle, Clock, XCircle, AlertTriangle, ShieldCheck, Info, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { getAllWithdrawals, processWithdrawal, rejectWithdrawal } from "../services/WithdrawalService";

type WithdrawalStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REJECTED';

interface Withdrawal {
    _id: string;
    instructorId: {
        _id: string;
        name: string;
        email: string;
        stripeAccountId?: string;
    };
    amount: number;
    status: WithdrawalStatus
    payoutMethod: 'STRIPE';
    payoutDetails: string;
    transactionId?: string;
    adminNotes?: string;
    createdAt: string;
    updatedAt: string;
}

const STATUS_OPTIONS: WithdrawalStatus[] = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REJECTED'];

const STATUS_STYLES: Record<string, string> = {
    PENDING:    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    PROCESSING: 'bg-blue-100   text-blue-800   dark:bg-blue-900/30   dark:text-blue-400',
    COMPLETED:  'bg-green-100  text-green-800  dark:bg-green-900/30  dark:text-green-500',
    FAILED:     'bg-red-100    text-red-800    dark:bg-red-900/30    dark:text-red-400',
    REJECTED:   'bg-gray-100   text-gray-800   dark:bg-gray-700      dark:text-gray-400',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
    PENDING:    <Clock className="w-3.5 h-3.5" />,
    PROCESSING: <RefreshCw className="w-3.5 h-3.5 animate-spin" />,
    COMPLETED:  <CheckCircle className="w-3.5 h-3.5" />,
    FAILED:     <XCircle className="w-3.5 h-3.5" />,
    REJECTED:   <AlertTriangle className="w-3.5 h-3.5" />,
};

const AdminWithdrawals: React.FC = () => {
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState<WithdrawalStatus | 'ALL'>('PENDING');
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const limit = 10;
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1); // Reset to page 1 on search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(()=>{
        window.scrollTo({top:0,behavior:'smooth'})
    },[page])

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['admin-withdrawals', statusFilter, debouncedSearch, page],
        queryFn: () => getAllWithdrawals({ 
            status: statusFilter, 
            search: debouncedSearch, 
            page, 
            limit 
        }),
        staleTime: 0,
    });

    const processMutation = useMutation({
        mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
            processWithdrawal(id, notes),
        onSuccess: () => {
            toast.success("Withdrawal processed and funds transferred!");
            queryClient.invalidateQueries({ queryKey: ["admin-withdrawals"] });
            setProcessingId(null);
        },
        onError: (err: unknown) => {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || "Failed to process withdrawal");
            setProcessingId(null);
        },
    });

    const rejectMutation = useMutation({
        mutationFn: ({ id, notes }: { id: string; notes: string }) =>
            rejectWithdrawal(id, notes),
        onSuccess: () => {
            toast.success("Withdrawal request rejected");
            queryClient.invalidateQueries({ queryKey: ["admin-withdrawals"] });
            setProcessingId(null);
        },
        onError: (err: unknown) => {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || "Failed to reject withdrawal");
            setProcessingId(null);
        },
    });

    const handleProcess = useCallback(
        (id: string) => {
            setProcessingId(id);
            processMutation.mutate({ id, notes: adminNotes[id] });
        },
        [processMutation, adminNotes]
    );

    const handleReject = useCallback(
        (id: string) => {
            const reason = adminNotes[id];
            if (!reason) {
                toast.error("Please provide a reason for rejection in the notes field");
                return;
            }
            setProcessingId(id);
            rejectMutation.mutate({ id, notes: reason });
        },
        [rejectMutation, adminNotes]
    );

    const withdrawals: Withdrawal[] = data?.data?.data || [];
    const totalCount = data?.data?.pagination?.total || 0;
    const totalPages = Math.ceil(totalCount / limit);

    return (
        <div className="p-6 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
                    Withdrawal Management
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                    Review and process instructor payout requests
                </p>
            </div>

            {/* Search and Filters Row */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 items-end md:items-center justify-between">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                        type="text"
                        placeholder="Search instructor name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl shadow-sm outline-none transition-all dark:text-white"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                    {STATUS_OPTIONS.map(s => (
                        <button
                            key={s}
                            onClick={() => { setStatusFilter(s); setPage(1); }}
                            className={`px-4 py-2 rounded-xl cursor-pointer text-sm font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                                statusFilter === s
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                    <button
                        onClick={() => { refetch(); toast.success("Data refreshed"); }}
                        className="p-2 bg-white cursor-pointer dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 transition-colors shrink-0"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-5 h-5 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {isError ? (
                    <div className="py-20 flex flex-col items-center gap-3 text-red-500">
                        <AlertTriangle className="w-10 h-10" />
                        <p className="font-bold">Failed to load withdrawals</p>
                    </div>
                ) : isLoading ? (
                    <div className="py-20 text-center text-gray-400 font-bold animate-pulse">
                        Loading withdrawals...
                    </div>
                ) : withdrawals.length === 0 ? (
                    <div className="py-20 text-center text-gray-400 font-bold">
                        No {statusFilter === 'ALL' ? '' : statusFilter} withdrawal requests found
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    <th className="px-6 py-4 font-bold">Instructor</th>
                                    <th className="px-6 py-4 font-bold">Amount</th>
                                    <th className="px-6 py-4 font-bold">Payout Details</th>
                                    <th className="px-6 py-4 font-bold">Status</th>
                                    <th className="px-6 py-4 font-bold">Requested</th>
                                    <th className="px-6 py-4 font-bold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {withdrawals.map((w) => (
                                    <tr key={w._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-900 dark:text-white text-sm">
                                                {w.instructorId?.name || 'Unknown'}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {w.instructorId?.email}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-nowrap">
                                            <span className="font-black text-gray-900 dark:text-white text-lg">
                                                ${w.amount.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            <div className="flex flex-col">
                                                <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-black uppercase">
                                                    <ShieldCheck className="w-3 h-3" /> {w.payoutMethod}
                                                </span>
                                                <span className="font-mono text-gray-500 dark:text-gray-400 mt-0.5 break-all max-w-[150px]">
                                                    {w.payoutDetails}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 items-start">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${STATUS_STYLES[w.status]}`}>
                                                    {STATUS_ICONS[w.status]}
                                                    {w.status}
                                                </span>
                                                {(w.status === 'FAILED' || w.status === 'REJECTED') && w.adminNotes && (
                                                    <span 
                                                        className="text-[10px] sm:text-xs text-red-500 font-medium max-w-[150px] break-words leading-tight" 
                                                        title={w.adminNotes}
                                                    >
                                                        Reason: {w.adminNotes}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(w.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {w.status === 'PENDING' ? (
                                                <div className="flex flex-col gap-2 min-w-[200px]">
                                                    <textarea
                                                        placeholder="Notes/Reason..."
                                                        rows={2}
                                                        value={adminNotes[w._id] || ''}
                                                        onChange={e =>
                                                            setAdminNotes(prev => ({ ...prev, [w._id]: e.target.value }))
                                                        }
                                                        className="text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                                                    />
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleProcess(w._id)}
                                                            disabled={processingId === w._id}
                                                            className="flex-1 flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold py-2 rounded-xl transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
                                                        >
                                                            {processingId === w._id ? <RefreshCw className="w-3 h-3 animate-spin"/> : <CheckCircle className="w-3 h-3" />}
                                                            Pay
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(w._id)}
                                                            disabled={processingId === w._id}
                                                            className="flex-1 flex items-center justify-center gap-1 bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold py-2 rounded-xl transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
                                                        >
                                                            {processingId === w._id ? <RefreshCw className="w-3 h-3 animate-spin"/> : <XCircle className="w-3 h-3" />}
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-start gap-1 text-xs text-gray-400 max-w-[150px]">
                                                    <Info className="w-3 h-3 mt-0.5 shrink-0" />
                                                    <span className="italic">
                                                        {w.adminNotes || 'No notes'}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination Footer */}
                {totalCount > limit && (
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-600 flex items-center justify-between">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Showing <span className="font-bold">{page*limit-(limit-withdrawals.length)}</span> of <span className="font-bold">{totalCount}</span> requests
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            </button>
                            <span className="px-4 text-sm font-bold text-gray-700 dark:text-gray-200">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminWithdrawals;
