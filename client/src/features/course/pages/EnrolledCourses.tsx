import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Card from "@shared/shimmer/Card";
import api from "@shared/utils/AxiosInstance";
import ErrorPage from "@shared/ui/ErrorPage";
import { RefreshCw, BookOpen } from "lucide-react";
import { toast } from "sonner";
import CourseRender from "../components/CourseRender";

const EnrolledCourses: React.FC = () => {
  const [page, setPage] = useState(1);
  const limit = 6;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["enrolled-courses", page],
    queryFn: async () => {
      const r = await api.get(`/enrollment/my-enrollments?page=${page}&limit=${limit}`);
      return r.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <Card />;
  if (isError) return <ErrorPage message={(error as Error).message} statusCode={500} />;

  const courses = data?.data?.data || [];
  const totalPages = Math.ceil((data?.data?.totalCount || 0) / limit);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pb-8">
      <div className="bg-gray-100 dark:bg-gray-800 shadow-sm px-6 py-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 mb-6">
        <h1 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-indigo-600" />
          My Enrolled Courses
        </h1>
        <button
          onClick={() => {
            refetch();
            toast.success("Courses refreshed");
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg cursor-pointer"
        >
          <RefreshCw className="w-5 h-5" />
          Refresh
        </button>
      </div>

      <div className="px-6">
        {courses.length > 0 ? (
          <CourseRender
            data={courses}
            page={page}
            totalPages={totalPages}
            setPage={setPage}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">No courses found</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">You haven't enrolled in any courses yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnrolledCourses;
