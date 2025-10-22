import React, { useState, useMemo, useEffect } from "react";
import default_profile from "../../../assets/defualt_profile.svg";
import { CheckCircle, XCircle, UserX, RefreshCw } from "lucide-react";

import TableShimmer from "@shared/shimmer/Table";
import Modal from "@shared/ui/Modal";

import { blockStudent, unBlockStudent } from "../services/StudentService";
import { toast } from "sonner";
import Spiner from "@shared/ui/Spiner";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import api from "@shared/utils/AxiosInstance";
import Pagination from "@shared/ui/Pagination";
import type { IStudent } from "../types/IStudent";

const ITEMS_PER_PAGE = 6;

const StudentManagement: React.FC = () => {
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"block" | "unblock">("block");
  const [selectedStudent, setSelectedStudent] = useState({ id: "", name: "" });
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['students', page],
    queryFn: () => api.get(`/students/allStudents?page=${page}&limit=${ITEMS_PER_PAGE}`).then(r => r.data?.data),
    staleTime: 5 * 60 * 1000
  });

  const students = data?.students?.data || [];
  const meta = data?.students?.meta;

  // Mutation for blocking/unblocking students
  const toggleStudentStatusMutation = useMutation({
    mutationFn: async ({ studentId, status, name }: { studentId: string; status: 'active' | 'blocked'; name: string }) => {
      if (status === 'active') {
        await unBlockStudent({ studentId, status });
      } else {
        await blockStudent({ studentId, status });
      }
      return { studentId, status, name };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success(`User ${data.status === 'active' ? 'Unblocked' : 'Blocked'} Successfully`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update student status");
    }
  });

  // Handle error display in useEffect to avoid conditional hook calls
  useEffect(() => {
    if (isError) {
      toast.error((error as any)?.response?.data?.message || "Failed to fetch data");
    }
  }, [isError, error]);

  const handleAction = (id: string, action: "active" | "blocked", name: string) => {
    setSelectedStudent({ name, id });
    setModalAction(action === "active" ? "unblock" : "block");
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    setIsModalOpen(false);
    const newStatus = modalAction === "unblock" ? "active" : "blocked";
    toggleStudentStatusMutation.mutate({
      studentId: selectedStudent.id,
      status: newStatus,
      name: selectedStudent.name
    });
  };

  // Memoized student rows for better performance - must be called before any conditional returns
  const studentRows = useMemo(() =>
    students.map((student: IStudent, i: number) => (
      <tr
        key={student.email}
        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900 dark:text-white">
          {(page - 1) * ITEMS_PER_PAGE + i + 1}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="h-10 w-10 flex-shrink-0">
              <img
                className="h-10 w-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                src={student.profilePictureUrl ?? default_profile}
                alt={student.name}
              />
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-lg font-medium text-gray-900 dark:text-white">
          {student.name}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-500 dark:text-gray-300 hidden md:table-cell">
          {student.email}
        </td>
        <td className="px-6 py-4 whitespace-nowrap  text-lg text-gray-500 dark:text-gray-300 hidden lg:table-cell">
          {student.registeredVia}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span
            className={`inline-flex px-2 py-1 text-lg font-semibold rounded-full ${
              student.accountStatus === 'blocked'
                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            }`}
          >
            {student.accountStatus}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-lg font-medium">
          {student.accountStatus === "blocked" ? (
            <button
              onClick={() => handleAction(student._id, "active", student.name)}
              disabled={toggleStudentStatusMutation.isPending}
              className="inline-flex items-center px-3 py-2 border border-transparent text-lg leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors cursor-pointer disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Unblock
            </button>
          ) : (
            <button
              onClick={() => handleAction(student._id, "blocked", student.name)}
              disabled={toggleStudentStatusMutation.isPending}
              className="inline-flex items-center px-3 py-2 border border-transparent text-lg leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors cursor-pointer disabled:opacity-50"
            >
              <XCircle className="w-4 h-4 mr-1" />
              Block
            </button>
          )}
        </td>
      </tr>
    )), [students, page, toggleStudentStatusMutation.isPending]);

  if (isLoading) {
    return <Spiner />;
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
        {isLoading ? (
          <TableShimmer />
        ) : students.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserX className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Students Found</h3>
            <p className="text-gray-500 dark:text-gray-400">There are no students registered in the system.</p>
          </div>
        ) : (
          <table className="w-full min-w-max">
            <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
              <tr>
                <th className="px-4 py-5 text-left text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">No</th>
                <th className="px-4 py-5 text-left text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Profile</th>
                <th className="px-4 py-5 text-left text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Name</th>
                <th className="px-4 py-5 text-left text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider hidden md:table-cell">Email</th>
                <th className="px-4 py-5 text-left text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider hidden lg:table-cell">Registration Method</th>
                <th className="px-4 py-5 text-left text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Status</th>
                <th className="px-4 py-5 text-left text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {studentRows}
            </tbody>
          </table>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={modalAction === "unblock" ? "Unblock User" : "Block User"}
          onConfirm={handleSubmit}
        >
          <p className="text-center dark:text-white my-8 text-lg">
            Are you sure you want to {modalAction} the user <br />
            <strong>{selectedStudent.name}</strong>?
          </p>
        </Modal>
      </div>

      {meta && meta.totalPages > 1 && (
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};

export default StudentManagement;
