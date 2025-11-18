import React, { useState, useMemo, useCallback } from "react";
import default_profile from "../../../assets/defualt_profile.svg";
import { CheckCircle, XCircle, UserX, RotateCcw, Trash2, RefreshCw, Eye } from "lucide-react";

import TableShimmer from "@shared/shimmer/Table";
import Modal from "@shared/ui/Modal";
import Spiner from "@shared/ui/Spiner";

import type { Instructor } from "../types/IInstructor";
import { approveRequest, changeInstructorStatusRequest, declineRequest } from "../services/InstructorService";
import { toast } from "sonner";

import DropDown from "@shared/ui/DropDown";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import api from "@shared/utils/AxiosInstance";
import ErrorPage from "@shared/ui/ErrorPage";
import Pagination from "@shared/ui/Pagination";
import type { IReqestPlayload } from "../types/IReqestPlayload";

const INSTRUCTOR_OPTIONS = ['Pending Instructors', 'Approved Instructors','Suspended Instructors','Rejected Instructors'];
const ITEMS_PER_PAGE = 12;

const InstructorManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropDownOpend, setIsDropDownOpend] = useState(false);
  const [dropDownValue, setDropDownValue] = useState(INSTRUCTOR_OPTIONS[0]);
  const [modalTitle, setModalTitle] = useState("");
  const [selectedInstructor, setSelectedInstructor] = useState({ id: "", name: "" });
  const [reason, setReason] = useState("");
  const [modelError, setModelError] = useState("");
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['instructors', dropDownValue, page],
    queryFn: () => api.get(`/instructors/getInstructors?status=${dropDownValue}&page=${page}&limit=${ITEMS_PER_PAGE}`).then(r => r.data),
    staleTime: 5 * 60 * 1000
  });

  const handleAction = useCallback((id: string, action: "approve" | "decline" | 'suspend' | 'reOpen' | 'delete', name: string) => {
    setSelectedInstructor({ name, id });
    setModalTitle(action === "approve" ? "Approve Instructor" : action === 'decline' ? "Decline Instructor" : action === 'suspend' ? 'Suspend Instructor' : action === 'delete' ? 'Delete Instructor' : "ReOpen Instructor");
    setIsModalOpen(true);
  }, []);

  const handleViewResume = useCallback(async (instructorId: string) => {
    try {
      // Open resume in a new tab by making a GET request to the resume endpoint
      window.open(`${api.defaults.baseURL}/instructors/${instructorId}/resume`, '_blank');
    } catch (error) {
      console.error('Error opening resume:', error);
      toast.error('Failed to open resume');
    }
  }, []);

  const approveMutation = useMutation({
    mutationFn: approveRequest,
    onSuccess: () => {
      toast.success("Request Approved");
      queryClient.invalidateQueries({ queryKey: ['instructors', dropDownValue, page] });
    },
    onError: (error) => {
      toast.error("Failed to approve instructor");
      console.error(error);
    }
  });

  const declineMutation = useMutation({
    mutationFn: declineRequest,
    onSuccess: () => {
      toast.success("Request Declined!!");
      queryClient.invalidateQueries({ queryKey: ['instructors', dropDownValue, page] });
    },
    onError: (error) => {
      toast.error("Failed to decline instructor");
      console.error(error);
    }
  });

  const suspendMutation = useMutation({
    mutationFn: (data: IReqestPlayload) => changeInstructorStatusRequest(data),
    onSuccess: () => {
      toast.success("Account Suspended!!");
      queryClient.invalidateQueries({ queryKey: ['instructors', dropDownValue, page] });
    },
    onError: (error) => {
      toast.error("Failed to suspend instructor");
      console.error(error);
    }
  });

  const reOpenMutation = useMutation({
    mutationFn: (data: IReqestPlayload) => changeInstructorStatusRequest(data),
    onSuccess: () => {
      toast.success("Account ReOpened!!");
      queryClient.invalidateQueries({ queryKey: ['instructors', dropDownValue, page] });
    },
    onError: (error) => {
      toast.error("Failed to re-open instructor account");
      console.error(error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (instructorId: string) => api.delete(`/instructors/${instructorId}`),
    onSuccess: () => {
      toast.success("Account Deleted!!");
      queryClient.invalidateQueries({ queryKey: ['instructors', dropDownValue, page] });
    },
    onError: (error) => {
      toast.error("Failed to delete instructor account");
      console.error(error);
    }
  });

  const handleSubmit = useCallback((reason?: string) => {
    setIsModalOpen(false);
    setReason('');
    setModelError('');
    if (modalTitle === "Approve Instructor") {
      approveMutation.mutate({ instructorId: selectedInstructor.id });
    } else if (modalTitle === 'Decline Instructor') {
      declineMutation.mutate({ instructorId: selectedInstructor.id, reason: reason! });
    } else if (modalTitle === "Suspend Instructor") {
      suspendMutation.mutate({ instructorId: selectedInstructor.id, reason: reason!, status: 'suspend' });
    } else if (modalTitle === "ReOpen Instructor") {
      reOpenMutation.mutate({ instructorId: selectedInstructor.id, status: 'active' });
    } else if (modalTitle === "Delete Instructor") {
      deleteMutation.mutate(selectedInstructor.id);
    }
  }, [modalTitle, selectedInstructor, approveMutation, declineMutation, suspendMutation, reOpenMutation, deleteMutation]);

  const handleListStatus = useCallback((option: string) => {
    setIsDropDownOpend(false);
    setDropDownValue(option);
    setPage(1);
    // Invalidate and refetch data when dropdown changes
    queryClient.invalidateQueries({ queryKey: ['instructors', option, 1] });
  }, [queryClient]);

  const isAnyMutationLoading = approveMutation.isPending || declineMutation.isPending || suspendMutation.isPending || reOpenMutation.isPending || deleteMutation.isPending;

  // Memoized instructor rows for better performance
  const instructorRows = useMemo(() =>
    data?.data?.data?.map((inst: Instructor, index: number) => (
      <tr
        key={inst._id}
        className="hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900 dark:text-white">
          {(page - 1) * ITEMS_PER_PAGE + index + 1}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="h-10 w-10 flex-shrink-0">
              <img
                className="h-10 w-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                src={inst.profile ?? default_profile}
                alt={inst.name}
              />
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-lg font-medium text-gray-900 dark:text-gray-300">
          {inst.name}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-500 dark:text-gray-300">
          {inst.email }
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-500 dark:text-gray-300 hidden lg:table-cell">
          {inst.subject}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-500 dark:text-gray-300 hidden md:table-cell">
          {inst.jobTitle || 'N/A'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-500 dark:text-gray-300 hidden lg:table-cell">
          {inst.experience || 'N/A'} Years
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-lg hidden xl:table-cell">
          <a
            href={inst.socialProfile || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center"
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </a>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-lg hidden xl:table-cell">
          <a
            href={inst.portfolio || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center"
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </a>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-lg hidden xl:table-cell">
          {inst.resumeUrl ? (
            <button
              onClick={() => handleViewResume(inst._id)}
              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center cursor-pointer"
            >
              <Eye className="w-4 h-4 mr-1" />
              View Resume
            </button>
          ) : (
            <span className="text-gray-500 dark:text-gray-400">N/A</span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-normal text-gray-500 dark:text-gray-300 text-lg hidden xl:table-cell">
          <div className="max-w-xs flex flex-wrap" title={inst.bio}>
            {inst.bio || 'N/A'}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-300 text-lg hidden xl:table-cell">
          {inst.phoneNumber || 'N/A'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span
            className={`inline-flex px-6 py-2 text-lg font-semibold rounded-full ${
              inst.approved
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : inst.accountStatus === 'pending'
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            }`}
          >
            {inst.accountStatus}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-lg font-medium">
          {inst.accountStatus === "pending" && !inst.approved ? (
            <div className="flex space-x-2">
              <button
                onClick={() => handleAction(inst._id, "approve", inst.name)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-lg leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer focus:ring-green-500"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve
              </button>
              <button
                onClick={() => handleAction(inst._id, "decline", inst.name)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-lg leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer focus:ring-red-500"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Decline
              </button>
            </div>
          ) : inst.accountStatus === "active" && inst.approved ? (
            <button
              onClick={() => handleAction(inst._id, "suspend", inst.name)}
              className="inline-flex items-center px-2 py-2 border border-transparent text-lg leading-4 font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer focus:ring-yellow-500"
            >
              <UserX className="w-4 h-4 mr-1" />
              Suspend
            </button>
          ) : inst.accountStatus === "rejected" && inst.rejected ? (
            <button
              onClick={() => handleAction(inst._id, "delete", inst.name)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-lg leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer focus:ring-red-500"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </button>
          ) : (
            <button
              onClick={() => handleAction(inst._id, "reOpen", inst.name)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-lg leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer focus:ring-blue-500"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Re-open
            </button>
          )}
        </td>
      </tr>
    )), [data?.data?.data, page, handleAction]);

  if (isLoading) return <TableShimmer />;

  if (isError) return <ErrorPage message={error?.message || "An error occurred"} statusCode={(error as any)?.status || 500} />;



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
                refetch()
                toast.success("Instructor Data refreshed")
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-x-auto border border-gray-200 dark:border-gray-700" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style dangerouslySetInnerHTML={{ __html: `
          div::-webkit-scrollbar {
            display: none;
          }
        ` }} />
        {isLoading ? (
          <TableShimmer />
        ) : data?.data?.data?.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserX className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Instructors Found</h3>
            <p className="text-gray-500 dark:text-gray-400">There are no instructors matching the selected criteria.</p>
          </div>
        ) : (
          <table className="w-full min-w-max" >
            <thead className="bg-gradient-to-r from-indigo-100 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">NO</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Profile</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider hidden lg:table-cell">Subject</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider hidden md:table-cell">Job Title</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider hidden lg:table-cell">Experience</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider hidden xl:table-cell">Social</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider hidden xl:table-cell">Portfolio</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider hidden xl:table-cell">Resume</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider hidden xl:table-cell">Bio</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider hidden xl:table-cell">Phone</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 ">
              {instructorRows}
            </tbody>
          </table>
        )}

        {modalTitle === "Approve Instructor" ? (
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalTitle} onConfirm={handleSubmit}>
            <p className="text-center dark:text-white my-8 text-lg ">
              Are You Sure To Accept <br />
              <strong>{selectedInstructor.name}</strong>
            </p>
          </Modal>
        ) : modalTitle ==='Decline Instructor'? (
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={`Decline Instructor ${selectedInstructor.name}`}
            onConfirm={() => {
              if (!reason.trim()) return setModelError("Reason Is Required");
              if (reason.trim().length<5) return setModelError("Please Provide A Valid Reason");
              setModelError('')
              handleSubmit(reason);
            }}
          >
            <textarea
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason..."
            />
            {modelError && <p className="text-red-500 text-lg mt-1">{modelError}</p>}
          </Modal>
        ): modalTitle ==='Suspend Instructor'? (
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={`Suspend Instructor ${selectedInstructor.name}`}
            onConfirm={() => {
              if (!reason.trim()) return setModelError("Reason Is Required");
              if (reason.trim().length<5) return setModelError("Please Provide A Valid Reason");
              setModelError('')
              handleSubmit(reason);
            }}
          >
            <textarea
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason..."
            />
            {modelError && <p className="text-red-500 text-lg mt-1">{modelError}</p>}
          </Modal>
        ): modalTitle ==='ReOpen Instructor'? (
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalTitle} onConfirm={handleSubmit}>
            <p className="text-center dark:text-white my-8 text-lg ">
              Are You Sure To Re-Open <br />
              <strong>{selectedInstructor.name}</strong>
            </p>
          </Modal>
        ): <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalTitle} onConfirm={handleSubmit}>
            <p className="text-center dark:text-white my-8 text-lg ">
              Are You Sure To Delete This Instructor Account <br />
              <strong>{selectedInstructor.name}</strong>
            </p>
          </Modal>}
      </div>
          {data?.data?.meta.totalPages > 1 && (
              <Pagination
                page={data?.data?.meta?.page}
                totalPages={data?.data?.meta?.totalPages}
                onPageChange={setPage}
              />
            )}
      {isAnyMutationLoading && <Spiner />}
    </div>
  );
};

export default InstructorManagement;
