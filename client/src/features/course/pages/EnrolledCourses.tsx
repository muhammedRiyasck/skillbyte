import React, { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import Card from "@shared/shimmer/Card";
import api from "@shared/utils/AxiosInstance";
import ErrorPage from "@shared/ui/ErrorPage";
import { RefreshCw, BookOpen } from "lucide-react";
import { toast } from "sonner";
import CourseRender from "../components/CourseRender";
import { DebouncedInput } from "@/shared/ui";

const EnrolledCourses: React.FC = () => {
  const [page, setPage] = useState(1);
  const limit = 6;

  const [filters, setFilters] = useState({
    search: '',
    status: '',
  });

  const handleSearch = useCallback((text: string) => {
    setFilters((prev) => {
      if (prev.search === text) return prev;
      return { ...prev, search: text };
    });
    setPage(1);
  }, []);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["enrolled-courses", page, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);

      const r = await api.get(`/enrollment/my-enrollments?${params.toString()}`);
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
      <div className="lg:sticky top-0 z-10 bg-white dark:bg-gray-900 pt-4 pb-2 border-b border-gray-200 dark:border-gray-700">
        <div className="bg-gray-100 dark:bg-gray-800 shadow-sm px-6 py-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 lg:mb-4">
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
        
        <div className="px-6 pb-2">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <DebouncedInput
                id="enrolled_course_search"
                type="text"
                placeholder="Search enrolled courses..."
                value={filters.search}
                setValue={handleSearch}
                className="px-4 py-2 bg-gray-50 w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="flex gap-2">
              {[
                { label: 'All', value: '' },
                { label: 'In Progress', value: 'active' },
                { label: 'Completed', value: 'completed' },
              ].map((status) => (
                <button
                  key={status.label}
                  onClick={() => {
                    setFilters(prev => ({ ...prev, status: status.value }));
                    setPage(1);
                  }}
                  className={`px-4 py-2 cursor-pointer rounded-lg text-sm font-medium transition-colors ${
                    filters.status === status.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </div>
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
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
              {filters.search || filters.status ? 'No matching courses found' : 'No courses found'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {filters.search || filters.status 
                ? 'Try adjusting your filters' 
                : "You haven't enrolled in any courses yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnrolledCourses;
