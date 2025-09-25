import React, { useEffect, useState } from "react";
import fetchData from "../../../shared/utils/fetchData";
import default_profile from "../../../assets/defualt_profile.svg";

import InstructorRequestShimmer from "../../../shared/shimmer/Table";
import Modal from "../../../shared/ui/Modal";

import type { Instructor } from "../types/IInstructor";
import { approveReqest, declineReqest } from "../services/UpdateRequest";
import { toast } from "sonner";
import Spiner from "../../../shared/ui/Spiner";

const InstructorRequests: React.FC = () => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [spiner, setSpiner] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [selectedInstructor, setSelectedInstructor] = useState({ id: "", name: "" });
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    fetchData("/instructors/pendings", setInstructors, setLoading);
  }, [refresh]);

  const handleAction = (id: string, action: "approve" | "decline", name: string) => {
    setSelectedInstructor({ name: name, id: id });
    setModalTitle(action === "approve" ? "Approve Instructor" : "Decline Instructor");
    setIsModalOpen(true);
  };

  const handleSubmit = async (reason?: string) => {
    try {
      setIsModalOpen(false)
      setSpiner(true);
      if (modalTitle === "Approve Instructor") {
        await approveReqest({ id: selectedInstructor.id });
        toast.success("Request Approved");
      } else {
        await declineReqest({ id: selectedInstructor.id, reason: reason });
        toast.warning("Request Declined!!");
      }
    } finally {
      setRefresh((pre) => !pre);
      setSpiner(false);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-800">
      {spiner && <Spiner />}
      <h1 className="text-2xl font-semibold mb-6 dark:text-blue-100 text-center">Instructor Requests</h1>
      <div className="overflow-x-auto rounded-lg shadow-md bg-gray-150 ">
        {loading ? (
          <InstructorRequestShimmer />
        ) : !instructors ? (
          <p className="text-2xl text-red-800 text-center my-8">No Data Found</p>
        ) : (
          <table className="w-full border-collapse  ">
            <thead>
              <tr className="bg-gray-200 border-b border-gray-400 text-left dark:bg-gray-700 font-serif dark:text-blue-100">
                <th className="px-6 py-3">Profile</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Subject</th>
                <th className="px-6 py-3">Job Title</th>
                <th className="px-6 py-3">Experience</th>
                <th className="px-6 py-3">Social Profile</th>
                <th className="px-6 py-3">Portfolio</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {instructors.map((inst) => (
                <tr
                  key={inst._id}
                  className="border-b border-gray-300 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-700 dark:text-blue-100"
                >
                  <td className="px-6 py-3">
                    <img
                      src={inst.profile ?? default_profile}
                      alt={inst.name}
                      className="h-12 w-12 rounded-full border"
                    />
                  </td>
                  <td className="px-6 py-3">{inst.name}</td>
                  <td className="px-6 py-3">{inst.email}</td>
                  <td className="px-6 py-3">{inst.subject}</td>
                  <td className="px-6 py-3">{inst.jobTitle}</td>
                  <td className="px-6 py-3">{inst.experience}</td>
                  <td className="px-6 py-3">
                    <a
                      href={inst.socialProfile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400  cursor-pointer"
                    >
                      View
                    </a>
                  </td>
                  <td className="px-6 py-3">
                    <a
                      href={inst.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 cursor-pointer"
                    >
                      View
                    </a>
                  </td>
                  <td className="px-6 py-3 text-center">
                    {inst.accountStatus === "pending" && !inst.approved ? (
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={() => handleAction(inst._id, "approve", inst.name)}
                          className="px-4 py-2 bg-green-400 dark:bg-green-800 hover:bg-green-700 hover:cursor-pointer text-white rounded-4xl transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(inst._id, "decline", "")}
                          className="px-4 py-2 bg-red-400 dark:bg-red-800 hover:bg-red-700 hover:cursor-pointer text-white rounded-4xl transition"
                        >
                          Decline
                        </button>
                      </div>
                    ) : (
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium  ${
                          inst.approved ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {inst.accountStatus}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
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
        ) : (
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Decline Instructor"
            onConfirm={() => {
              if (!reason.trim()) return setError("Reason Is Required");
              if (reason.trim().length<5) return setError("Please Provide A Valid Reason");
              setError('')
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
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </Modal>
        )}
      </div>
    </div>
  );
};

export default InstructorRequests;
