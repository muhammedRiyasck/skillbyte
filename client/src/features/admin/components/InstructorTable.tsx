import React, { useState, useMemo, useCallback } from "react";
import default_profile from "../../../assets/defualt_profile.svg";
import { CheckCircle, XCircle, UserX, RotateCcw, Trash2, Eye } from "lucide-react";

import Table from "@shared/ui/Table";
import Modal from "@shared/ui/Modal";
import { toast } from "sonner";
import type { Instructor } from "../types/IInstructor";
import type { IReqestPlayload } from "../types/IReqestPlayload";
import api from "@/shared/utils/AxiosInstance";

interface InstructorTableProps {
  data: {
    data: {
      data: Instructor[];
    };
  };
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onApprove: (instructorId: string) => void;
  onDecline: (payload: { instructorId: string; reason: string }) => void;
  onSuspend: (payload: { instructorId: string; reason: string; status: string }) => void;
  onReOpen: (payload: IReqestPlayload) => void;
  onDelete: (instructorId: string) => void;
}

const InstructorTable: React.FC<InstructorTableProps> = ({
  data,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  onApprove,
  onDecline,
  onSuspend,
  onReOpen,
  onDelete,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [selectedInstructor, setSelectedInstructor] = useState<{ id: string; name: string }>({ id: "", name: "" });
  const [reason, setReason] = useState("");
  const [modalError, setModalError] = useState("");

  const instructorsWithIndex = useMemo(() => {
    return data?.data?.data?.map((inst: Instructor, index: number) => ({
      ...inst,
      index: (currentPage - 1) * 12 + index + 1,
    })) || [];
  }, [data?.data?.data, currentPage]);

  const handleViewResume = useCallback(async (instructorId: string) => {
    try {
      window.open(`${api.defaults.baseURL}/instructors/${instructorId}/resume`, '_blank');
    } catch (error) {
      console.error('Error opening resume:', error);
      toast.error('Failed to open resume');
    }
  }, []);

  const handleAction = useCallback((id: string, action: "approve" | "decline" | "suspend" | "reOpen" | "delete", name: string) => {
    setSelectedInstructor({ id, name });
    setModalTitle(
      action === "approve"
        ? "Approve Instructor"
        : action === "decline"
        ? "Decline Instructor"
        : action === "suspend"
        ? "Suspend Instructor"
        : action === "delete"
        ? "Delete Instructor"
        : "ReOpen Instructor"
    );
    setIsModalOpen(true);
    setReason("");
    setModalError("");
  }, []);

  const handleSubmit = useCallback(() => {
    setIsModalOpen(false);
    setModalError("");
    switch (modalTitle) {
      case "Approve Instructor":
        onApprove(selectedInstructor.id);
        break;
      case "Decline Instructor":
        if (!reason.trim()) {
          setModalError("Reason Is Required");
          setIsModalOpen(true);
          return;
        }
        if (reason.trim().length < 5) {
          setModalError("Please Provide A Valid Reason");
          setIsModalOpen(true);
          return;
        }
        onDecline({ instructorId: selectedInstructor.id, reason: reason.trim() });
        break;
      case "Suspend Instructor":
        if (!reason.trim()) {
          setModalError("Reason Is Required");
          setIsModalOpen(true);
          return;
        }
        if (reason.trim().length < 5) {
          setModalError("Please Provide A Valid Reason");
          setIsModalOpen(true);
          return;
        }
        onSuspend({ instructorId: selectedInstructor.id, reason: reason.trim(), status: "suspend" });
        break;
      case "ReOpen Instructor":
        onReOpen({ instructorId: selectedInstructor.id, status: "active" });
        break;
      case "Delete Instructor":
        onDelete(selectedInstructor.id);
        break;
    }
    setReason("");
  }, [modalTitle, onApprove, onDecline, onSuspend, onReOpen, onDelete, reason, selectedInstructor.id]);

  const columns = useMemo(() => [
    {
      header: "NO",
      accessor: (row: Instructor & { index: number }) => row.index,
    },
    {
      header: "Profile",
      accessor: (row: Instructor) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            <img
              className="h-10 w-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
              src={row.profile ?? default_profile}
              alt={row.name}
            />
          </div>
        </div>
      ),
    },
    {
      header: "Name",
      accessor: (row: Instructor) => row.name,
    },
    {
      header: "Email",
      accessor: (row: Instructor) => row.email,
    },
    {
      header: "Subject",
      accessor: (row: Instructor) => row.subject,
      className: "hidden md:table-cell",
    },
    {
      header: "Job Title",
      accessor: (row: Instructor) => row.jobTitle || "N/A",
      className: "hidden sm:table-cell",
    },
    {
      header: "Experience",
      accessor: (row: Instructor) => (row.experience ? `${row.experience} Years` : "N/A"),
      className: "hidden md:table-cell",
    },
    {
      header: "Social",
      accessor: (row: Instructor) => (
        <a
          href={row.socialProfile || "#"}

          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center"
        >
          <Eye className="w-4 h-4 mr-1" />
          View
        </a>
      ),
      className: "hidden xl:table-cell",
    },
    {
      header: "Portfolio",
      accessor: (row: Instructor) => (
        <a
          href={row.portfolio || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center"
        >
          <Eye className="w-4 h-4 mr-1" />
          View
        </a>
      ),
      className: "hidden lg:table-cell",
    },
    {
      header: "Resume",
      accessor: (row: Instructor) =>
        row.resumeUrl ? (
          <button
            onClick={() => handleViewResume(row._id)}
            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center cursor-pointer"
          >
            <Eye className="w-4 h-4 mr-1" />
            View Resume
          </button>
        ) : (
          <span className="text-gray-500 dark:text-gray-400">N/A</span>
        ),
      className: "hidden lg:table-cell",
    },
{
  header: "Bio",
  accessor: (row: Instructor) => (
    <div
      className="max-w-xs break-words overflow-hidden text-ellipsis whitespace-normal"
      title={row.bio}
      style={{ wordBreak: 'break-word',  overflow: 'hidden' }}
    >
      {row.bio || "N/A"}
    </div>
  ),
  className: "hidden lg:table-cell",
},
    {
      header: "Phone",
      accessor: (row: Instructor) => row.phoneNumber || "N/A",
      className: "hidden lg:table-cell",
    },
    {
      header: "Status",
      accessor: (row: Instructor) => (
        <span
          className={`inline-flex px-6 py-2 text-lg font-semibold rounded-full ${
            row.approved
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : row.accountStatus === "pending"
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          }`}
        >
          {row.accountStatus}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: (row: Instructor) => {
        if (row.accountStatus === "pending" && !row.approved) {
          return (
            <div className="flex space-x-2">
              <button
                onClick={() => handleAction(row._id, "approve", row.name)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-lg leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer focus:ring-green-500"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve
              </button>
              <button
                onClick={() => handleAction(row._id, "decline", row.name)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-lg leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer focus:ring-red-500"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Decline
              </button>
            </div>
          );
        } else if (row.accountStatus === "active" && row.approved) {
          return (
            <button
              onClick={() => handleAction(row._id, "suspend", row.name)}
              className="inline-flex items-center px-2 py-2 border border-transparent text-lg leading-4 font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer focus:ring-yellow-500"
            >
              <UserX className="w-4 h-4 mr-1" />
              Suspend
            </button>
          );
        } else if (row.accountStatus === "rejected" && row.rejected) {
          return (
            <button
              onClick={() => handleAction(row._id, "delete", row.name)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-lg leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer focus:ring-red-500"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </button>
          );
        } else {
          return (
            <button
              onClick={() => handleAction(row._id, "reOpen", row.name)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-lg leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer focus:ring-blue-500"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Re-open
            </button>
          );
        }
      },
    },
  ], [handleAction, handleViewResume]);

  return (
    <>
      <Table<Instructor & { index: number }>
        columns={columns}
        data={instructorsWithIndex}
        isLoading={isLoading}
        emptyComponent={
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserX className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Instructors Found</h3>
            <p className="text-gray-500 dark:text-gray-400">There are no instructors matching the selected criteria.</p>
          </div>
        }
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />

      {modalTitle === "Approve Instructor" ? (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalTitle} onConfirm={handleSubmit}>
          <p className="text-center dark:text-white my-8 text-lg ">
            Are You Sure To Accept <br />
            <strong>{selectedInstructor.name}</strong>
          </p>
        </Modal>
      ) : modalTitle === "Decline Instructor" ? (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Decline Instructor ${selectedInstructor.name}`}
          onConfirm={() => {
            if (!reason.trim()) return setModalError("Reason Is Required");
            if (reason.trim().length < 5) return setModalError("Please Provide A Valid Reason");
            setModalError("");
            handleSubmit();
          }}
        >
          <textarea
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason..."
          />
          {modalError && <p className="text-red-500 text-lg mt-1">{modalError}</p>}
        </Modal>
      ) : modalTitle === "Suspend Instructor" ? (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Suspend Instructor ${selectedInstructor.name}`}
          onConfirm={() => {
            if (!reason.trim()) return setModalError("Reason Is Required");
            if (reason.trim().length < 5) return setModalError("Please Provide A Valid Reason");
            setModalError("");
            handleSubmit();
          }}
        >
          <textarea
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason..."
          />
          {modalError && <p className="text-red-500 text-lg mt-1">{modalError}</p>}
        </Modal>
      ) : modalTitle === "ReOpen Instructor" ? (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalTitle} onConfirm={handleSubmit}>
          <p className="text-center dark:text-white my-8 text-lg ">
            Are You Sure To Re-Open <br />
            <strong>{selectedInstructor.name}</strong>
          </p>
        </Modal>
      ) : modalTitle === "Delete Instructor" ? (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalTitle} onConfirm={handleSubmit}>
          <p className="text-center dark:text-white my-8 text-lg ">
            Are You Sure To Delete This Instructor Account <br />
            <strong>{selectedInstructor.name}</strong>
          </p>
        </Modal>
      ) : null}
    </>
  );
};

export default InstructorTable;
