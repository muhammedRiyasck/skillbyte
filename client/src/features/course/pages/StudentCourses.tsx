import React, {  useState } from "react";
import {  useQuery } from "@tanstack/react-query";
import { CourseCard } from "../";
import Card from "@shared/shimmer/Card";
import Pagination from "@shared/ui/Pagination";
import api from "@shared/utils/AxiosInstance";
import ErrorPage from "@shared/ui/ErrorPage";
import { RefreshCw, BookOpen } from "lucide-react";
import { toast } from "sonner";

const StudentCourses: React.FC = () => {
  const [page, setPage] = useState(1);

  const limit = 6

  const { data, isLoading, isError,error ,refetch } = useQuery({
    queryKey: [ page],
    queryFn: () => api.get(`/course/published-courses?status=list&page=${page}&limit=${limit}`).then(r => r.data),
    staleTime: 5 * 60 * 1000 
  });
  if (isLoading) return <Card/>
  console.log(data,'course data');
  if (isError) return <p><ErrorPage message={error.message} statusCode={(error as any)?.status || 500}/></p>;

  return (
    <div className="min-h-screen bg-gradient-to-br bg-white dark:bg-gray-900   pb-8">
      <div className="bg-gray-100 dark:bg-gray-800 shadow-sm px-6 py-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-indigo-600" />
          All Courses
        </h1>
        <button
          onClick={() => {refetch();toast.success('Courses refreshed')}}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg cursor-pointer"
        >
          <RefreshCw className="w-5 h-5" />
          Refresh
        </button>
      </div>
      { !data?.data?.courses?.data[0] ? (
        <div className="flex flex-col items-center justify-center py-16">
          <BookOpen className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-xl text-gray-600 dark:text-gray-400 text-center">No courses found</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Check back later for new courses!</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-6 mt-8">
          <CourseCard courses={data?.data?.courses?.data} isStudent={true} />
        </div>
      )}
      {data?.data?.courses?.meta?.totalPages > 1 && (
        <div className="max-w-7xl mx-auto px-6 mt-8">
          <Pagination
            page={data?.data?.courses?.meta?.page}
            totalPages={data?.data?.courses?.meta?.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};

export default StudentCourses;
