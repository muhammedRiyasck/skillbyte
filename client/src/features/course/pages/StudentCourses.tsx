import React, {  useState } from "react";
import {  useQuery } from "@tanstack/react-query";
import Card from "@shared/shimmer/Card";
import api from "@shared/utils/AxiosInstance";
import ErrorPage from "@shared/ui/ErrorPage";
import { RefreshCw, BookOpen } from "lucide-react";
import { toast } from "sonner";
import CourseRender from "../components/CourseRender";
import { useSelector } from 'react-redux';
import type { RootState } from '@/core/store/Index';

const StudentCourses: React.FC = () => {
  const [page, setPage] = useState(1);
  const email = useSelector((state: RootState) => state.auth.user?.email);

  const limit = 6

  const { data, isLoading, isError,error ,refetch } = useQuery({
    queryKey: [page, email],
    queryFn: () => api.get(`/course/published-courses?status=list&page=${page}&limit=${limit}`).then(r => r.data),
    staleTime: 5 * 60 * 1000
  });
  if (isLoading) return <Card/>
  console.log(data,'course data');
  if (isError) return <p><ErrorPage message={error.message} statusCode={500}/></p>;

  return (
    <div className="min-h-screen bg-gradient-to-br bg-white dark:bg-gray-900   pb-8">
      <div className="bg-gray-100 dark:bg-gray-800 shadow-sm px-6 py-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
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

      <CourseRender data={data?.data?.courses?.data} page={page} totalPages={data?.data?.courses?.meta?.totalPages || 1} setPage={setPage}   />
    </div>
  );
};

export default StudentCourses;
