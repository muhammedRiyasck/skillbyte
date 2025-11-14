import React, {  useState } from "react";
import {  useQuery } from "@tanstack/react-query";
import { CourseCard } from "../";
import Card from "@shared/shimmer/Card";
import Pagination from "@shared/ui/Pagination";
import api from "@shared/utils/AxiosInstance";
import ErrorPage from "@shared/ui/ErrorPage";
import DropDown from "@shared/ui/DropDown";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

const options = ["All Courses", "Drafted Courses", "Listed Courses", "Unlisted Courses"];

const InstructorCourses: React.FC = () => {
  const [page, setPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(options[0]);

  const limit = 6

  const { data, isLoading, isError,error ,refetch } = useQuery({
    queryKey: ['courses',selectedStatus, page],
    queryFn: () => api.get(`/course/instructor-courses?status=${selectedStatus}&page=${page}&limit=${limit}`).then(r => r.data),
    staleTime: 5 * 60 * 1000 
  });

  if (isLoading) return <Card/>
  
  if (isError) return <p><ErrorPage message={error.message} statusCode={(error as any)?.status || 500}/></p>;
  const handleListStatus = (option: string) => {
    setIsOpen(false);
    setSelectedStatus(option);
  };
  return (
    <div className="min-h-screen bg-white  dark:bg-gray-900 pb-8">
      <div className="bg-gray-200 dark:bg-gray-700 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">{selectedStatus}</h1>
        <div className=" flex ">
          <button className="p-3 mx-4 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md cursor-pointer"
              title="Refresh data"
              onClick={() => {refetch();toast.success('Course Reffreshed')} }
              > 
              <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
           {/* <img src={refresh} className="mr-6 block mb-auto  cursor-pointer w-10 h-10" onClick={() => refetch()}/> */}
            <DropDown options={options} isOpen={isOpen} setIsOpen={setIsOpen} handleListStatus={handleListStatus} selectedValue={selectedStatus}/>
        </div>
      </div>
      { !data?.data?.data[0] ? (
        <p className="text-2xl text-red-800 text-center my-8">No Data Found</p>
      ) : (
        <div className="max-w-7xl mx-auto mt-18">
          <CourseCard courses={data?.data?.data} />
        </div>
      )}
        {data?.data?.meta?.totalPages > 1 && (
        <Pagination
          page={data.data?.meta.page}
          totalPages={data.data?.meta.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};

export default InstructorCourses;
