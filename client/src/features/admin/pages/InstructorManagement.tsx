import React, { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@shared/utils/AxiosInstance";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import DropDown from "@shared/ui/DropDown";
import InstructorTable from "../components/InstructorTable";
import { approveRequest, changeInstructorStatusRequest, declineRequest, deleteInstructor } from "../services/InstructorService";
import type { IReqestPlayload } from "../types/IReqestPlayload";
const INSTRUCTOR_OPTIONS = ['Pending Instructors', 'Approved Instructors','Suspended Instructors','Rejected Instructors'];
const ITEMS_PER_PAGE = 12;

const InstructorManagement: React.FC = () => {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [dropDownValue, setDropDownValue] = useState(INSTRUCTOR_OPTIONS[0]);
  const [isDropDownOpend, setIsDropDownOpend] = useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['instructors', dropDownValue, page],
    queryFn: () => api.get(`/instructors/getInstructors?status=${dropDownValue}&page=${page}&limit=${ITEMS_PER_PAGE}`).then(r => r.data),
    staleTime: 5 * 60 * 1000
  });

  const approveMutation = useMutation({
    mutationFn: (data: IReqestPlayload) => approveRequest(data),
    onSuccess: () => {
      toast.success("Request Approved");
      queryClient.invalidateQueries({ queryKey: ['instructors', dropDownValue, page] });
    },
    onError: () => {
      toast.error("Failed to approve instructor");
    }
  });

  const declineMutation = useMutation({
    mutationFn: (data: IReqestPlayload) => declineRequest(data),
    onSuccess: () => {
      toast.success("Request Declined!!");
      queryClient.invalidateQueries({ queryKey: ['instructors', dropDownValue, page] });
    },
    onError: () => {
      toast.error("Failed to decline instructor");
    }
  });

  const suspendMutation = useMutation({
    mutationFn: (data: IReqestPlayload) => changeInstructorStatusRequest(data),
    onSuccess: () => {
      toast.success("Account Suspended!!");
      queryClient.invalidateQueries({ queryKey: ['instructors', dropDownValue, page] });
    },
    onError: () => {
      toast.error("Failed to suspend instructor");
    }
  });

  const reOpenMutation = useMutation({
    mutationFn: (data: IReqestPlayload) => changeInstructorStatusRequest(data),
    onSuccess: () => {
      toast.success("Account ReOpened!!");
      queryClient.invalidateQueries({ queryKey: ['instructors', dropDownValue, page] });
    },
    onError: () => {
      toast.error("Failed to re-open instructor account");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (instructorId: string) => deleteInstructor(instructorId),
    onSuccess: () => {
      toast.success("Account Deleted!!");
      queryClient.invalidateQueries({ queryKey: ['instructors', dropDownValue, page] });
    },
    onError: () => {
      toast.error("Failed to delete instructor account");
    }
  });

  const handleApprove = useCallback((instructorId: string) => {
    approveMutation.mutate({ instructorId });
  }, [approveMutation]);

  const handleDecline = useCallback((payload: { instructorId: string; reason: string }) => {
    declineMutation.mutate(payload);
  }, [declineMutation]);

  const handleSuspend = useCallback((payload: { instructorId: string; reason: string; status: string }) => {
    suspendMutation.mutate({ ...payload, status: "suspend" });
  }, [suspendMutation]);

  const handleReOpen = useCallback(({ instructorId }: { instructorId: string }) => {
    reOpenMutation.mutate({ instructorId, status: "active" });
  }, [reOpenMutation]);

  const handleDelete = useCallback((instructorId: string) => {
    deleteMutation.mutate(instructorId);
  }, [deleteMutation]);

  const handleListStatus = useCallback((option: string) => {
    setIsDropDownOpend(false);
    setDropDownValue(option);
    setPage(1);
    queryClient.invalidateQueries({ queryKey: ['instructors', option, 1] });
  }, [queryClient]);

  if (isLoading) {
    return (
      <div className="p-6 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex justify-center items-center">
        <p>{(error as any)?.message || "An error occurred"}</p>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">Instructor Management</h1>
        <p className="text-gray-600 dark:text-gray-300">Manage and oversee instructor accounts efficiently</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-xl flex items-center justify-center shadow-sm">
              <RefreshCw className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">{dropDownValue}</h2>
              <p className="text-lg text-gray-500 dark:text-gray-400">Filter and manage instructors</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                refetch();
                toast.success("Instructor Data refreshed");
              }}
              className="p-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md cursor-pointer"
              title="Refresh data"
            >
              <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <DropDown
              options={INSTRUCTOR_OPTIONS}
              isOpen={isDropDownOpend}
              setIsOpen={setIsDropDownOpend}
              handleListStatus={handleListStatus}
              selectedValue={dropDownValue}
            />
          </div>
        </div>
      </div>
      <InstructorTable
        data={data}
        isLoading={isLoading}
        currentPage={data?.data?.meta?.page || 1}
        totalPages={data?.data?.meta?.totalPages || 1}
        onPageChange={setPage}
        onApprove={handleApprove}
        onDecline={handleDecline}
        onSuspend={handleSuspend}
        onReOpen={handleReOpen}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default InstructorManagement;
