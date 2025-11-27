import { X } from "lucide-react";
import type { ModuleType } from "../../types/IModule";

import LessonItem from "./LessonItem";
import { validateModule } from "../../validation/ModuleValidation";
import ErrorMessage from "@shared/ui/ErrorMessage";
import { useState, useCallback } from "react";
import { createModule } from "../../services/CourseModule";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  courseId: string;
  module: ModuleType;
  order: number;
  setModules: React.Dispatch<React.SetStateAction<ModuleType[]>>;
}

interface prevState {
  moduleTitle: string;
  moduleDescription: string;
}

export default function ModuleItem({ courseId, module, order, setModules }: Props) {
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState<Record<string, { success: boolean; message: string }>>({});
  const [editModule, setEditModule] = useState<{ disable: boolean; initial: boolean; prevState: prevState }>({
    disable: !/^\d{13,}$/.test(module.moduleId),
    initial: /^\d{13,}$/.test(module.moduleId),
    prevState: { moduleTitle: "", moduleDescription: "" },
  });
  const updateModule = useCallback((updated: ModuleType) => {
    setModules((prev) => prev.map((m) => (m.moduleId === module.moduleId ? updated : m)));
  }, [module.moduleId, setModules]);
  const addLesson = useCallback(async () => {
    const moduleValidationErrors = validateModule({ title: module.title, description: module.description });
    setErrors(moduleValidationErrors);

    if (Object.keys(moduleValidationErrors).length === 0) {
      let Module 
      if(/^\d{13,}$/.test(module.moduleId)) {
         Module = await createModule({
          courseId,
          order,
          moduleId: module.moduleId,
          title: module.title,
          description: module.description,
          
        });
      }
      updateModule({
        
        ...Module?.data ? Module.data : module,
        lessons: [
          ...module?.lessons,
          !/^\d{13,}$/.test(module.moduleId)&&{ lessonId: Date.now().toString(), title: "", description: "", fileName: "", resources: [], },
        ],
      });
      // Invalidate the queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['modulesAndLesson', courseId, 'modules,lessons'] });
      
    }
  }, [module, courseId, order, updateModule, queryClient]);

  const handleEditDiscard = useCallback((moduleId: string) => {
    setModules((prev) =>
      prev.map((m) =>
        m.moduleId === moduleId
          ? { ...m, title: editModule.prevState.moduleTitle, description: editModule.prevState.moduleDescription }
          : m
      )
    );
    setEditModule({ disable: true, initial: false, prevState: { moduleTitle: "", moduleDescription: "" } });
  }, [editModule.prevState, setModules]);

  const removeModule = useCallback((moduleId: string) => {
    setModules((prev) => prev.filter((m) => m.moduleId !== moduleId));
  }, [setModules]);

  return (
    <div className=" space-y-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
      <div className="flex ">
        {order > 1 && (
          <button className="cursor-pointer" onClick={() => removeModule(module.moduleId)}>
            <X size={32} />
          </button>
        )}
        <p className="ml-auto font-bold text-lg text-right">Module No : {order}</p>
      </div>

      <div className="bg-gray-200  dark:bg-gray-800 p-8 space-y-4 rounded-2xl">
        {editModule && !editModule.initial && (
          <button
            onClick={() =>
              setEditModule({
                disable: false,
                initial: false,
                prevState: { moduleTitle: module.title, moduleDescription: module.description },
              })
            }
            className="text-2xl block ml-auto cursor-pointer"
          >
            &#128393;
          </button>
        )}
        <div>
          <label htmlFor="module_title" className="text-center block text-xl mb-1 dark:text-white">
            Module Title
          </label>
          <input
            id="module_title"
            type="text"
            placeholder="Module Title"
            value={module.title}
            disabled={editModule.disable}
            onChange={(e) => updateModule({ ...module, title: e.target.value })}
            className="w-full border border-gray-400 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <ErrorMessage error={errors?.title?.message} />
        </div>
        <div>
          <label htmlFor="description" className="text-center block text-xl dark:text-white">
            Module Description
          </label>
          <textarea
            id="description"
            rows={5}
            placeholder="Module Description"
            className="w-full border mt-1 border-gray-400 dark:bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={module.description}
            disabled={editModule.disable}
            onChange={(e) => updateModule({ ...module, description: e.target.value })}
          />
          <ErrorMessage error={errors?.description?.message} />
        </div>

        {!editModule.disable && !editModule.initial && (
          <div className="block text-right">
            <button onClick={() => handleEditDiscard(module.moduleId)} className="outline m-2 p-2 rounded cursor-pointer">
              Discard
            </button>
            <button className="outline m-2 p-2 rounded cursor-pointer">Change</button>
          </div>
        )}
      </div>
      {module.lessons.map((lesson, index) => (
        <LessonItem
          key={lesson.lessonId ? lesson.lessonId : `lesson-${index}`}
          lesson={lesson}
          moduleId={module.moduleId}
          order={index + 1}
          setModules={setModules}
        />
      ))}

      <button
        className={`mt-2 rounded  hover:bg-gray-500 px-3 py-1 text-white cursor-pointer ${/^\d{13,}$/.test(module.moduleId) ? 'bg-gray-950':'bg-gray-600'}`}
        onClick={addLesson}
      >
        {/^\d{13,}$/.test(module.moduleId)?'Create Moduele' : 'Add Lesson'}
      </button>
    </div>
  );
}
