
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@shared/utils/AxiosInstance";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import StudentTable from "../components/StudentTable";

const ITEMS_PER_PAGE = 6;

const StudentManagement: React.FC = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['students', page],
    queryFn: () =>
      api.get(`/students/allStudents?page=${page}&limit=${ITEMS_PER_PAGE}`).then(r => r.data?.data),
    staleTime: 5 * 60 * 1000,
  });

  const students = data?.students?.data || [];
  const meta = data?.students?.meta;

  if (isError) {
    toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to fetch data");
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">Student Management</h1>
        <p className="text-gray-600 dark:text-gray-300">Manage and oversee student accounts efficiently</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">All Students</h2>
              <p className="text-lg text-gray-500 dark:text-gray-400">Manage student accounts and access</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                refetch();
                toast.success("User Data refreshed");
              }}
              disabled={isLoading}
              className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-300 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-x-auto border border-gray-200 dark:border-gray-700">
        <StudentTable
          students={students}
          isLoading={isLoading}
          currentPage={meta?.page}
          totalPages={meta?.totalPages}
          onPageChange={setPage}
          refetch={refetch}
        />
      </div>
    </div>
  );
};

export default StudentManagement;
