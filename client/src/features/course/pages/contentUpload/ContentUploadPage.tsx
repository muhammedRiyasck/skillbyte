import { useState, useMemo, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ROUTES } from "@core/router/paths";
import { useQuery } from "@tanstack/react-query";

import type { ModuleType } from "../../types/IModule";
import ModuleList from "./ModuleList";
import api from "@shared/utils/AxiosInstance";
import type { LessonType } from "../../types/ILesson";
import { useCourse } from "../../hooks/useCourse";
import { Plus } from "lucide-react";

const ContentUploadPage = () => {
  const location = useLocation();
  const id = location.state?.id ?? null;
  const page = location.state?.page ?? 1;

  const { data, isLoading, isError, error } = useCourse(id, "modules,lessons");
  const [modules, setModules] = useState<ModuleType[]>([]);

  // Memoize data.modules to prevent unnecessary re-renders
  const courseModules = useMemo(() => data?.modules || [], [data]);

  // Memoize file names to avoid recalculating
  const fileNames = useMemo(() => {
    if (!courseModules.length) return [];
    return courseModules
      .flatMap((mod: ModuleType) => mod.lessons.map((les: LessonType) => les.fileName ?? ""))
      .filter((fileName: string) => fileName !== "");
  }, [courseModules]);

  // Use useQuery for signed URLs with caching
  const { data: signedUrlsData } = useQuery({
    queryKey: ["signedUrls", id, fileNames.sort().join(",")],
    queryFn: async () => {
      if (!fileNames.length) return [];
      const response = await api.post("/course/signedUrl", { fileNames });
      return response.data.data; // [{ fileName, url }, ...]
    },
    enabled: !!id && fileNames.length > 0,
  });

  // 1. Initial Data Loading: Only runs when data first arrives or id changes
  useEffect(() => {
    if (!data) return;

    // Only initialize if we don't have modules yet, or if the course ID changed
    const hasOnlyDrafts = modules.length === 0 || modules.every(m => /^\d{13,}$/.test(m.id));

    if (courseModules.length > 0 && hasOnlyDrafts) {
      setModules(courseModules);
    } else if (modules.length === 0) {
      // Default empty module if nothing exists at all
      setModules([{ id: Date.now().toString(), title: "", description: "", lessons: [] }]);
    }
  }, [id, courseModules, data, modules]);

  // 2. Signed URL Syncing: Updates existing state without overwriting local edits
  useEffect(() => {
    if (!signedUrlsData || !signedUrlsData.length) return;

    setModules((prev) =>
      prev.map((mod) => ({
        ...mod,
        lessons: mod.lessons.map((les) => {
          const signedUrlItem = signedUrlsData.find(
            (item: { fileName: string; url: string }) => item.fileName === les.fileName
          );
          return signedUrlItem ? { ...les, signedVideoUrl: signedUrlItem.url } : les;
        }),
      }))
    );
  }, [signedUrlsData]);

  const addModule = () => {
    setModules((prev) => [...prev, { id: Date.now().toString(), title: "", description: "", lessons: [] }]);
  };

  if (!id) {
    return (
      <div className="min-h-screen flex-col p-8 space-y-2 pt-50 dark:text-white dark:bg-gray-900">
        <h1 className="text-center mx-auto text-2xl">Sorry, We Can't Figure Out The Base Info!</h1>
        <p className="text-center mx-auto text-xl">
          Please Go Back To{" "}
          <Link className="font-bold" to={`${ROUTES.instructor.myCourses}?page=${page}`}>
            My Courses
          </Link>
          &nbsp; Or &nbsp;
          <Link className="font-bold" to={ROUTES.instructor.createCourseBase}>
            Create A New One
          </Link>
          .
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center dark:text-white dark:bg-gray-900">
        Loading modules...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex justify-center items-center dark:text-white dark:bg-gray-900">
        Error loading modules: {error?.message || "Unknown error"}
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:bg-gray-900 dark:text-gray-200 relative">
      <div className="bg-gray-200 z-10 fixed w-full dark:bg-gray-700 p-6 flex justify-between items-center">
        <div className="flex  flex-wrap items-center space-x-2">
          <Link
            to={`${ROUTES.instructor.myCourses}?page=${page}`}
            className="text-blue-600 font-bold hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            My Courses
          </Link>
          <span className="text-gray-500 dark:text-gray-400">{">"}</span>
          <Link
            to={ROUTES.instructor.createCourseBase}
            state={{ id, page }}
            className="text-blue-600 font-bold hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            Course Details
          </Link>
          <span className="text-gray-500 dark:text-gray-400">{">"}</span>
          <span className="text-xl font-bold text-gray-800 dark:text-white">Upload Content</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold my-4 text-center dark:text-white">Modules & Lessons</h1>
        <ModuleList id={id} modules={modules} setModules={setModules} />
        <div className="flex justify-between">
          <button
            className="flex items-center gap-1 mt-4 cursor-pointer rounded px-4 py-2 dark:text-white outline bg-gray-100 dark:bg-gray-700 hover:bg-gray-400"
            onClick={addModule}
          >
            <Plus size={18} />
            <span>Add Module</span>
          </button>
          <Link
            to={`${ROUTES.instructor.myCourses}?page=${page}`}
            className="mt-4 cursor-pointer rounded px-4 py-2 dark:text-white outline bg-gray-100 dark:bg-gray-700 hover:bg-gray-400"
          >
            ✔ Done
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ContentUploadPage;
