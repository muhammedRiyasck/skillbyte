import { X } from "lucide-react";
import TextInput from "@shared/ui/TextInput";
import type { ModuleType } from "../../types/IModule";

import LessonItem from "./LessonItem";
import { validateModule } from "../../validation/ModuleValidation";
import ErrorMessage from "@shared/ui/ErrorMessage";
import { useState } from "react";
import { createModule } from "../../services/CourseModule";

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
  const [errors, setErrors] = useState<Record<string, { success: boolean; message: string }>>({});
  const [editModule, setEditModule] = useState<{ disable: boolean; initial: boolean; prevState: prevState }>({
    disable: !/^\d{13,}$/.test(module.moduleId),
    initial: /^\d{13,}$/.test(module.moduleId),
    prevState: { moduleTitle: "", moduleDescription: "" },
  });
  const updateModule = (updated: ModuleType) => {
    setModules((prev) => prev.map((m) => (m.moduleId === module.moduleId ? updated : m)));
  };
  const addLesson = async () => {
    const moduleValidationErrors = validateModule({ title: module.title, description: module.description });
    setErrors(moduleValidationErrors);

    if (Object.keys(moduleValidationErrors).length === 0) {
      const createdModule = await createModule({
        courseId,
        order,
        moduleId: module.moduleId,
        title: module.title,
        description: module.description,
      });
      console.log(createdModule,createdModule,'createdModulecreatedModule')
      updateModule({
        ...module,
        ...createdModule?.data,
        lessons: [
          ...module.lessons,
          {
            lessonId: Date.now().toString(),
            title: "",
            description: "",
            contentType: "vedio",
            resources: [""],
            order: module.lessons.length + 1,
            moduleId: createdModule.moduleId,
            duration: 10,
          },
        ],
      });
    }
  };

  const handleEditDiscard = (moduleId: string) => {
    console.log(moduleId,'from discard button')
    setModules((prev) =>
      prev.map((m) =>
        m.moduleId === moduleId
          ? { ...m, title: editModule.prevState.moduleTitle, description: editModule.prevState.moduleDescription }
          : m
      )
    );
    setEditModule({ disable: true, initial: false, prevState: { moduleTitle: "", moduleDescription: "" } });
  };

  const removeModule = (moduleId: string) => {
    setModules((prev) => prev.filter((m) => m.moduleId !== moduleId));
  };

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
        className="mt-2 rounded bg-gray-600 hover:bg-gray-500 px-3 py-1 text-white cursor-pointer"
        onClick={addLesson}
      >
        + Add Lesson
      </button>
    </div>
  );
}
