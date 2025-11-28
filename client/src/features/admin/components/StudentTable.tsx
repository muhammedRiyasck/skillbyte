import React, { useState, useMemo, useCallback } from "react";
import default_profile from "@assets/default_profile.svg";
import { CheckCircle, UserX,  } from "lucide-react";

import Table from "@shared/ui/Table";
import Modal from "@shared/ui/Modal";
import {  changeStudentStatus } from "../services/StudentService";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Student {
  studentId: string;
  name: string;
  email: string;
  profilePictureUrl?: string;
  registeredVia: string;
  accountStatus: "active" | "blocked";
}

interface StudentTableProps {
  students: Student[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  refetch: () => void;
}


const StudentTable: React.FC<StudentTableProps> = ({
  students,
  isLoading,
  currentPage = 1,
  totalPages,
  onPageChange
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"block" | "unblock">("block");
  const [selectedStudent, setSelectedStudent] = useState<{ id: string; name: string }>({ id: "", name: "" });
  const queryClient = useQueryClient();

  const toggleStudentStatusMutation = useMutation({
    mutationFn: async ({ studentId, status }: { studentId: string; status: "active" | "blocked" }) => {
      await changeStudentStatus({ studentId, status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success(`User ${modalAction === "unblock" ? "Unblocked" : "Blocked"} Successfully`);
    },
    onError: (error: unknown) => {
      toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to update student status");
    }
  });

  const handleAction = useCallback((id: string, action: "active" | "blocked", name: string) => {
    setSelectedStudent({ id, name });
    setModalAction(action === "active" ? "unblock" : "block");
    setIsModalOpen(true);
  }, []);

  const handleSubmit = () => {
    setIsModalOpen(false);
    const newStatus = modalAction === "unblock" ? "active" : "blocked";
    toggleStudentStatusMutation.mutate({
      studentId: selectedStudent.id,
      status: newStatus,
    });
  };

  const studentsWithIndex = useMemo(() => {
    return students.map((student, idx) => ({
      ...student,
      index: currentPage && currentPage > 0 ? (currentPage - 1) * 6 + idx + 1 : idx + 1
    }));
  }, [students, currentPage]);

  const columns = useMemo(() => [
    {
      header: "No",
      accessor: (row: Student & { index: number }) => row.index,
    },
    {
      header: "Profile",
      accessor: (row: Student & {index:number}) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            <img
              className="h-10 w-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
              src={row.profilePictureUrl ?? default_profile}
              alt={row.name}
            />
          </div>
        </div>
      )
    },
    {
      header: "Name",
      accessor: (row: Student & {index:number}) => row.name,
    },
    {
      header: "Email",
      accessor: (row: Student ) => row.email,
      className: "hidden md:table-cell",
    },
    {
      header: "Registration Method",
      accessor: (row: Student & {index:number}) => row.registeredVia,
      className: "hidden lg:table-cell",
    },
    {
      header: "Status",
      accessor: (row: Student & {index:number}) => (
        <span
          className={`inline-flex px-2 py-1 text-lg font-semibold rounded-full ${
            row.accountStatus === "blocked"
              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          }`}
        >
          {row.accountStatus}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: (row: Student & {index:number}) => (
        row.accountStatus === "blocked" ? (
          <button
            onClick={() => handleAction(row.studentId, "active", row.name)}
            disabled={toggleStudentStatusMutation.status === "pending"}
            className="inline-flex items-center px-3 py-2 border border-transparent text-lg leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors cursor-pointer disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Unblock
          </button>
        ) : (
          <button
            onClick={() => handleAction(row.studentId, "blocked", row.name)}
            disabled={toggleStudentStatusMutation.status === "pending"}
            className="inline-flex items-center px-6 py-2 border border-transparent text-lg leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors cursor-pointer disabled:opacity-50"
          >
            {/* icon for block button from lucide-react */}
            <UserX className="w-4 h-4 mr-1" />
            Block
          </button>
        )
      ),
    }
  ], [handleAction, toggleStudentStatusMutation.status]);

  return (
    <>

      <Table<Student & {index:number}>
        columns={columns}
        data={studentsWithIndex}
        isLoading={isLoading}
        emptyComponent={
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserX className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Students Found</h3>
            <p className="text-gray-500 dark:text-gray-400">There are no students registered in the system.</p>
          </div>
        }
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />

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
    </>
  );
};

export default StudentTable;
