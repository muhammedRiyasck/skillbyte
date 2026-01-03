import React, {  useState, useEffect } from "react";
import {  useQuery } from "@tanstack/react-query";
import Card from "@shared/shimmer/Card";
import api from "@shared/utils/AxiosInstance";
import ErrorPage from "@shared/ui/ErrorPage";
import { RefreshCw, BookOpen } from "lucide-react";
import { toast } from "sonner";
import CourseRender from "../components/CourseRender";
import CourseFilters from "../components/CourseFilters";
import { useSelector } from 'react-redux';
import type { RootState } from '@/core/store/Index';

const StudentCourses: React.FC = () => {
  const [page, setPage] = useState(1);
  const email = useSelector((state: RootState) => state.auth.user?.email);

  const limit = 6

  const [filters, setFilters] = useState({
    category: '',
    level: '',
    priceRange: '',
    sort: 'createdAt:desc',
    search: '',
  });

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filters.category, filters.level, filters.priceRange, filters.sort, filters.search]);


  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get("/course/categories").then((res) => res.data.data),
    staleTime: 24 * 60 * 60 * 1000, 
  });
  
  const categories = categoriesData || [];


  const { data, isLoading, isError,error ,refetch } = useQuery({
    queryKey: ["courses", page, email, filters.category, filters.level, filters.priceRange, filters.sort, filters.search],

    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort: filters.sort,
        search: filters.search
      });

      if (filters.category) params.append('category', filters.category);
      if (filters.level) params.append('level', filters.level);

      if (filters.priceRange === 'free') {
        params.append('maxPrice', '0');
      } else if (filters.priceRange === 'paid') {
        params.append('minPrice', '1');
      }

      const r = await api.get(`/course/published-courses?${params.toString()}`);
      return r.data;
    },
    staleTime: 5 * 60 * 1000
  });
  if (isLoading) return <Card/>
  if (isError) return <p><ErrorPage message={error.message} statusCode={500}/></p>;

  return (
    <div className="min-h-screen bg-gradient-to-br bg-white dark:bg-gray-900   pb-8">
      {/* fix the div and coures filter on top with enough margin top */}
      <div className="lg:sticky top-0 z-10 bg-white dark:bg-gray-900 pt-4 pb-2 border-b border-gray-200 dark:border-gray-700">
      <div className="bg-gray-100 dark:bg-gray-800 shadow-sm px-6 py-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 lg:mb-4 ">
        <h1 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-indigo-600" />
         {` Explore Courses `}
        </h1>
        <button
          onClick={() => {refetch();toast.success('Courses refreshed')}}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg cursor-pointer"
        >
          <RefreshCw className="w-5 h-5" />
          Refresh
        </button>
      </div>
      <CourseFilters filters={filters} setFilters={setFilters} categories={categories} />
   </div>
      <CourseRender data={data?.data?.courses?.data} page={page} totalPages={data?.data?.courses?.meta?.totalPages || 1} setPage={setPage}   />
    </div>
  );
};

export default StudentCourses;
