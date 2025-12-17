import { BookOpen } from "lucide-react";
import { CourseCard, type Ibase } from "../";
import Pagination from "@shared/ui/Pagination";

interface CourseRenderProps {
  data: Ibase[];
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  role?: string ;
  onStatusChange?: ((courseId: string, status: string) => void) | undefined;
  onBlockChange?: ((courseId: string, isBlocked?: boolean) => void) | undefined;
}

const CourseRender = ({data,page,totalPages,setPage , role='student', onStatusChange , onBlockChange} :CourseRenderProps) => {
    
  return <div>
     { !data || data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <BookOpen className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-xl text-gray-600 dark:text-gray-400 text-center">No courses found</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Check back later for new courses!</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-6 mt-8">

          <CourseCard courses={data} role={role} page={page} onStatusChange={onStatusChange} onBlockChange={onBlockChange}/>
      </div>
      )}
      {totalPages > 1 && (
        <div className="max-w-7xl mx-auto px-6 mt-8">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
  </div>;
}

export default CourseRender;
