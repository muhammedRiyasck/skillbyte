import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import Card from "@shared/shimmer/Card";
import api from "@shared/utils/AxiosInstance";
import ErrorPage from "@shared/ui/ErrorPage";
import { RefreshCw, BookOpen, Search } from "lucide-react";
import { toast } from "sonner";
import CourseRender from "../components/CourseRender";
import { DebouncedInput } from "@/shared/ui";
import { EnrollmentStatus } from "@shared/enums/EnrollmentStatus";

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
    staleTime: 0,
  });

  if (isLoading) return <Card />;
  if (isError) return <ErrorPage message={(error as Error).message} statusCode={500} />;

  const courses = data?.data?.data || [];
  const totalPages = Math.ceil((data?.data?.totalCount || 0) / limit);

  return (
  <div className="min-h-screen bg-white dark:bg-[#050914] text-gray-900 dark:text-white pb-10">

    {/* ===================================================== */}
    {/* HEADER + FILTERS */}
    {/* ===================================================== */}

    <div className="lg:sticky lg:top-0 z-20 bg-white/95 dark:bg-[#050914]/95 backdrop-blur-xl">

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-5 lg:pt-6">

        {/* Header */}
        <div
          
          className="flex items-center justify-between gap-3 mb-5"
        >
          <div className="min-w-0">

            <p className="
              text-[10px]
              sm:text-[11px]
              font-semibold
              uppercase
              tracking-[0.18em]
              text-blue-600
              dark:text-blue-400
              mb-1
            ">
              Learning Library
            </p>

            <motion.h1 initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }} className="
              text-2xl
              sm:text-3xl
              md:text-4xl
              font-bold
              tracking-tight
              text-gray-950
              dark:text-white
              flex
              items-center
              gap-3
            ">

              <span>
                Enrolled Courses
              </span>
            </motion.h1>

          </div>

          {/* Refresh */}
          <button
            onClick={() => {
              refetch();
              toast.success("Courses refreshed");
            }}
            className="
              shrink-0
              inline-flex
              items-center
              justify-center
              gap-2
              h-10
              px-3
              sm:px-4
              rounded-xl
              border
              border-gray-200
              dark:border-gray-800
              bg-white
              dark:bg-[#0b1220]
              text-sm
              font-medium
              text-gray-700
              dark:text-gray-200
              shadow-sm
              hover:bg-gray-50
              dark:hover:bg-gray-800
              hover:border-gray-300
              dark:hover:border-gray-700
              hover:shadow-md
              transition-all
              duration-300
              cursor-pointer
            "
          >
            <RefreshCw className="w-4 h-4" />

            <span className="hidden sm:inline">
              Refresh
            </span>
          </button>
        </div>


        {/* ================================================= */}
        {/* FILTERS */}
        {/* ================================================= */}

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.25,
            delay: 0.05,
            ease: "easeOut",
          }}
          className="pb-5"
        >
          <div className="
            flex
            flex-col
            lg:flex-row
            gap-3
            lg:items-center
            justify-between
          ">

            {/* Search */}
            <div className="relative flex-1 max-w-xl">

              <Search
                className="
                  absolute
                  left-3.5
                  top-1/2
                  -translate-y-1/2
                  w-4
                  h-4
                  text-gray-400
                  dark:text-gray-500
                  pointer-events-none
                "
              />

              <DebouncedInput
                id="enrolled_course_search"
                type="text"
                placeholder="Search enrolled courses..."
                value={filters.search}
                setValue={handleSearch}
                className="
                  w-full
                  h-10
                  sm:h-11
                  pl-10
                  pr-4
                  rounded-xl
                  border
                  border-gray-200
                  dark:border-gray-800
                  bg-gray-50
                  dark:bg-[#0b1220]
                  text-sm
                  text-gray-800
                  dark:text-gray-200
                  placeholder:text-gray-400
                  dark:placeholder:text-gray-500
                  outline-none
                  transition-all
                  duration-200
                  focus:border-blue-500
                  focus:ring-4
                  focus:ring-blue-500/10
                  hover:border-gray-300
                  dark:hover:border-gray-700
                "
              />

            </div>


            {/* Status filters */}
            <div className="
              flex
              items-center
              gap-2
              overflow-x-auto
              pb-1
              lg:pb-0
            ">

              {[
                {
                  label: "All",
                  value: "",
                },
                {
                  label: "In Progress",
                  value: EnrollmentStatus.ACTIVE,
                },
                {
                  label: "Completed",
                  value: EnrollmentStatus.COMPLETED,
                },
              ].map((status) => {

                const isActive =
                  filters.status === status.value;

                return (
                  <motion.button
                    key={status.label}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setFilters((prev) => ({
                        ...prev,
                        status: status.value,
                      }));

                      setPage(1);
                    }}
                    className={`
                      shrink-0
                      h-10
                      px-4
                      rounded-xl
                      border
                      text-sm
                      font-medium
                      transition-all
                      duration-200
                      cursor-pointer

                      ${
                        isActive
                          ? `
                            border-blue-600
                            bg-blue-600
                            text-white
                            shadow-sm
                          `
                          : `
                            border-gray-200
                            dark:border-gray-800
                            bg-white
                            dark:bg-[#0b1220]
                            text-gray-700
                            dark:text-gray-300
                            hover:bg-gray-50
                            dark:hover:bg-gray-800
                            hover:border-gray-300
                            dark:hover:border-gray-700
                          `
                      }
                    `}
                  >
                    {status.label}
                  </motion.button>
                );
              })}

            </div>

          </div>
        </motion.div>


        {/* Bottom border */}
        <div className="border-b border-gray-200 dark:border-gray-800" />

      </div>
    </div>


    {/* ===================================================== */}
    {/* COURSE CONTENT */}
    {/* ===================================================== */}

    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.3,
        delay: 0.1,
        ease: "easeOut",
      }}
      className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-6"
    >

      {courses.length > 0 ? (

        <CourseRender
          data={courses}
          page={page}
          totalPages={totalPages}
          setPage={setPage}
        />

      ) : (

        /* ================================================= */
        /* EMPTY STATE */
        /* ================================================= */

        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.3,
          }}
          className="
            flex
            flex-col
            items-center
            justify-center
            text-center
            py-24
          "
        >

          <div className="
            w-16
            h-16
            rounded-2xl
            flex
            items-center
            justify-center
            bg-gray-100
            dark:bg-gray-800
            mb-5
          ">
            <BookOpen
              className="
                w-7
                h-7
                text-gray-400
                dark:text-gray-500
              "
            />
          </div>

          <h2 className="
            text-xl
            sm:text-2xl
            font-semibold
            text-gray-900
            dark:text-white
          ">
            {filters.search || filters.status
              ? "No matching courses found"
              : "No courses found"}
          </h2>

          <p className="
            text-sm
            text-gray-500
            dark:text-gray-400
            mt-2
            max-w-md
          ">
            {filters.search || filters.status
              ? "Try adjusting your search or filters."
              : "You haven't enrolled in any courses yet."}
          </p>

          {/* Clear filters */}
          {(filters.search || filters.status) && (
            <button
              onClick={() => {
                setFilters({
                  search: "",
                  status: "",
                });

                setPage(1);
              }}
              className="
                mt-5
                h-10
                px-4
                rounded-xl
                border
                border-gray-200
                dark:border-gray-800
                bg-white
                dark:bg-[#0b1220]
                text-sm
                font-medium
                text-gray-700
                dark:text-gray-200
                hover:bg-gray-50
                dark:hover:bg-gray-800
                transition-all
                duration-200
                cursor-pointer
              "
            >
              Clear Filters
            </button>
          )}

        </motion.div>

      )}

    </motion.div>

  </div>
);
};

export default EnrolledCourses;
