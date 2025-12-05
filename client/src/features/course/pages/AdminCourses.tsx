import React, {  useState } from "react";
import {  useQuery, useQueryClient } from "@tanstack/react-query";
import Card from "@shared/shimmer/Card";
import api from "@shared/utils/AxiosInstance";
import ErrorPage from "@shared/ui/ErrorPage";
import DropDown from "@shared/ui/DropDown";
import { BookOpen, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import CourseRender from "../components/CourseRender";


const options = ["All Courses", "Drafted Courses", "Listed Courses", "Unlisted Courses"];

const AdminCourses: React.FC = () => {
  const [page, setPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(options[0]);
  const queryClient = useQueryClient();

  const limit = 6

  const { data, isLoading, isError,error ,refetch } = useQuery({
    queryKey: ['courses',selectedStatus, page],
    queryFn: () => api.get(`/course/admin/courses?status=${selectedStatus}&page=${page}&limit=${limit}`).then(r => r.data),
    staleTime: 5 * 60 * 1000
  });

  console.log(data,'from admin courses page');

  if (isLoading) return <Card/>
  
  if (isError) return <p><ErrorPage message={error.message} statusCode={500}/></p>;
  const handleListStatus = (option: string) => {
    setIsOpen(false);
    setSelectedStatus(option);
  };

  const handleStatusChange = (courseId: string, status: string) => {
    // Update the local state by modifying the cached data
    queryClient.setQueryData(['courses', selectedStatus, page, ], (oldData: { data: { data: {_id: string;status: string;}[] } }) => {
      if (!oldData) return oldData;
      const updatedCourses = oldData.data.data.map((course: {_id: string;status: string;}
) =>
        course._id === courseId ? { ...course, status } : course
      );
      return {
        ...oldData,
        data: {
          ...oldData.data,
          data: updatedCourses
        }
      };
    });
  };
  return (
    <div className="min-h-screen bg-white  dark:bg-gray-900 pb-8">
      <div className="bg-gray-200 dark:bg-gray-700 px-6 py-4 flex justify-between items-center">
         <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <BookOpen className="w-8 h-8  text-indigo-600" />
          {selectedStatus}
        </h2>
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

      <CourseRender data={data?.data?.courses?.data} page={page} totalPages={data?.data?.courses?.meta?.totalPages || 1} setPage={setPage} role={'admin'} onStatusChange={handleStatusChange}  />
  
    </div>
  );
};

export default AdminCourses;
