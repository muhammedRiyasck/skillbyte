import React, {  useState } from "react";
import {  useQuery } from "@tanstack/react-query";
import { CourseCard } from "../";
import Card from "@shared/shimmer/Card";
import Pagination from "@shared/ui/Pagination";
import api from "@shared/utils/AxiosInstance";
import refresh from '../../../assets/Refresh.png'
import ErrorPage from "@shared/ui/ErrorPage";

const StudentCourses: React.FC = () => {
  const [page, setPage] = useState(1);

  const limit = 6

  const { data, isLoading, isError,error ,refetch } = useQuery({
    queryKey: ['courses', page],
    queryFn: () => api.get(`/course/published-courses?status=${"list"}&page=${page}&limit=${limit}`).then(r => r.data),
    staleTime: 5 * 60 * 1000 
  });
  if (isLoading) return <Card/>
  console.log(data,'course data')
  if (isError) return <p><ErrorPage message={error.message} statusCode={(error as any)?.status || 500}/></p>;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pb-8">
      <div className="bg-gray-200 dark:bg-gray-700 px-6 py-4 flex justify-between items-center">
          <img src={refresh} className="mr-6 cursor-pointer block ml-auto w-10 h-10" onClick={() => refetch()}/>
  
      </div>
      { !data?.data?.courses?.data[0] ? (
        <p className="text-2xl text-red-800 text-center my-8">No Data Found</p>
      ) : (
        <div className="max-w-7xl mx-auto mt-18">
          <CourseCard courses={data?.data?.courses?.data} isStudent={true} />
        </div>
      )}
        {data?.courses?.meta?.totalPages > 1 && (
        <Pagination
          page={data?.data?.courses?.meta?.page}
          totalPages={data?.data?.courses?.meta?.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};

export default StudentCourses;
