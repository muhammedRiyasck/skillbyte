import React, {  useState } from "react";
import {  useQuery } from "@tanstack/react-query";
import CourseCard from "../components/CourseCard";
import Card from "../../../shared/shimmer/Card";
import Pagination from "../../../shared/ui/Pagination";
import api from "../../../shared/utils/AxiosInstance";
import refresh from '../../../assets/Refresh.png'
import ErrorPage from "../../../shared/ui/ErrorPage";

const options = ["All Courses", "Drafted Courses", "Listed Courses", "Unlisted Courses"];

const InstructorCourses: React.FC = () => {
  const [page, setPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(options[0]);

  const limit = 6

  const { data, isLoading, isError,error ,refetch } = useQuery({
    queryKey: ['courses',selectedStatus, page],
    queryFn: () => api.get(`/course/courses?status=${selectedStatus}&page=${page}&limit=${limit}`).then(r => r.data),
    staleTime: 5 * 60 * 1000 
  });

  if (isLoading) return <Card/>
  
  if (isError) return <p><ErrorPage message={error.message} statusCode={(error as any)?.status || 500}/></p>;
  const handleSelect = (option: string) => {
    setIsOpen(false);
    setSelectedStatus(option);
  };
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pb-8">
      <div className="bg-gray-200 dark:bg-gray-700 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">{selectedStatus}</h1>
        <div className="relative flex ">
           <img src={refresh} className="mr-6 cursor-pointer w-10 h-10" onClick={() => refetch()}/>
          <div
            className="border border-gray-300 text-center w-48 rounded-lg px-5 py-2 dark:text-gray-300 shadow-lg cursor-pointer bg-white dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500"
            onClick={() => setIsOpen(!isOpen)}
          >
            {selectedStatus}
            {isOpen ? (
              <span className="font-size:100px;">&#129093; </span>
            ) : (
              <span className="font-size:100px;">&#129095;</span>
            )}
          </div>
          {isOpen && (
            <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-700 border border-gray-300 rounded-lg mt-1 shadow-lg z-10">
              <div className="py-1">
                {options.map((option, index) => (
                  <div
                    key={index}
                    className="px-5 py-2 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer rounded-lg mx-2 my-1"
                    onClick={() => handleSelect(option)}
                  >
                    {option}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      { !data.data[0] ? (
        <p className="text-2xl text-red-800 text-center my-8">No Data Found</p>
      ) : (
        <div className="max-w-7xl mx-auto mt-18">
          <CourseCard courses={data.data} />
        </div>
      )}
        {data?.meta.totalPages > 1 && (
        <Pagination
          page={data.meta.page}
          totalPages={data.meta.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};

export default InstructorCourses;
