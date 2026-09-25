import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Card from "@shared/shimmer/Card";
import api from "@shared/utils/AxiosInstance";
import ErrorPage from "@shared/ui/ErrorPage";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import CourseRender from "../components/CourseRender";
import CourseFilters from "../components/CourseFilters";
import { useSelector } from 'react-redux';
import type { RootState } from '@/core/store/Index';
import { CourseCategory } from "@shared/enums/CourseCategory";
import { CourseLevel } from "@shared/enums/CourseLevel";


const StudentCourses: React.FC = () => {
  const [page, setPage] = useState(1);
  const email = useSelector((state: RootState) => state.auth.user?.email);

  const limit = 6

  const [filters, setFilters] = useState({
    category: '' as CourseCategory | '',
    level: '' as CourseLevel | '',
    priceRange: '',
    sort: 'createdAt:desc',
    search: '',
  });


  useEffect(() => {
    setPage(1);
  }, [filters.category, filters.level, filters.priceRange, filters.sort, filters.search]);


  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get("/course/categories").then((res) => res.data.data),
    staleTime: 24 * 60 * 60 * 1000,
  });

  const categories = categoriesData || [];


  const { data, isLoading, isError, error, refetch } = useQuery({
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
    staleTime: 0
  });
  if (isLoading) return <Card />
  if (isError) return <ErrorPage message={error.message} statusCode={500} />;

return (
  <div className="min-h-screen bg-white dark:bg-[#050914] text-gray-900 dark:text-white pb-10">
    {/* Sticky Header */}
    <div className="lg:sticky lg:top-0 z-20 bg-white/95 dark:bg-[#050914]/95 backdrop-blur-xl">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-5 lg:pt-6">

        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400 mb-1">
              Course Library
            </p>

            <motion.h1 initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }} className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-gray-950 dark:text-white">
              Explore Courses
            </motion.h1>
          </div>

          <button
            onClick={() => {
              refetch();
              toast.success("Courses refreshed");
            }}
            className="
              shrink-0
              inline-flex items-center justify-center gap-2
              h-10
              px-3 sm:px-4
              rounded-xl
              border border-gray-200 dark:border-gray-800
              bg-white dark:bg-[#0b1220]
              text-sm font-medium
              text-gray-700 dark:text-gray-200
              shadow-sm
              hover:bg-gray-50 dark:hover:bg-gray-800
              hover:border-gray-300 dark:hover:border-gray-700
              transition-all duration-200
              cursor-pointer
            "
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filters */}
        <CourseFilters
          filters={filters}
          setFilters={setFilters}
          categories={categories}
        />

        {/* Divider */}
        <div className="border-b border-gray-200 dark:border-gray-800" />
      </div>
    </div>

    {/* Courses */}
    <CourseRender
      data={data?.data?.courses?.data}
      page={page}
      totalPages={data?.data?.courses?.meta?.totalPages || 1}
      setPage={setPage}
    />
  </div>
);
};

export default StudentCourses;
