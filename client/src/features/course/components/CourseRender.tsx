import { BookOpen } from "lucide-react";
import { CourseCard, type Ibase } from "../";
import Pagination from "@/shared/components/Pagination";

interface CourseRenderProps {
  data: Ibase[];
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  role?: string;
}


const CourseRender = ({ data, page, totalPages, setPage, role = 'student' }: CourseRenderProps) => {

  return (
    <div>
      {!data || data.length === 0 ? (
        <div className="max-w-[1600px] mx-auto px-6 py-24">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="
            w-16 h-16
            rounded-2xl
            flex items-center justify-center
            bg-gray-100 dark:bg-gray-800
            mb-5
          ">
              <BookOpen className="w-7 h-7 text-gray-400 dark:text-gray-500" />
            </div>

            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              No courses found
            </p>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Check back later for new courses!
            </p>
          </div>
        </div>
      ) : (
        <div className="max-w-[1600px] mx-auto px-6 pt-6">
          {/* Result count */}
          <div className="mb-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {data.length}
              <span className="ml-1">
                {data.length === 1 ? 'result' : 'results'}
              </span>
            </p>
          </div>

          {/* Courses */}
          <CourseCard
            courses={data}
            role={role}
            page={page}
          />
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="max-w-[1600px] mx-auto px-6 mt-10 pb-8">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}

export default CourseRender;
