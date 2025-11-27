import React, { useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";

import type { ModuleType } from "../../types/IModule";
import type { LessonType } from "../../types/ILesson";
import UploadProgressBar from "../../components/UploadProgressBar";
import TextInput from "@shared/ui/TextInput";
import DynamicField from "../../components/DynamicField";
import { validateLesson } from "../../validation/LessonValidation";
import ErrorMessage from "@shared/ui/ErrorMessage";
import { createLesson, getPresignedUrl, uploadFile } from "../../services/CourseLesson";
import { getVideoDuration } from "../../utility/GetVideoDuration";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  lesson: LessonType;
  moduleId: string;
  order: number;
  setModules: React.Dispatch<React.SetStateAction<ModuleType[]>>;
}

export default function LessonItem({ lesson, moduleId, order, setModules }: Props) {
  const [title, setTitle] = useState(lesson.title);
  const [prevURL, setPrevURL] = useState<string | null>(null);
  const prevURLRef = useRef<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  // const [editLesson, setEditLesson] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadStared,setUploadStared] = useState<boolean>(false)
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<Record<string, { success: boolean; message: string }>>({});
  const queryClient = useQueryClient();

  const { control, watch } = useForm<{ resources: string[] }>({
    defaultValues: { resources: lesson.resources as string[] },
  });

  const watchedResources = watch("resources");
  const updateLesson = useCallback((changes: Partial<LessonType>) => {
    setModules((prev) =>
      prev.map((m) =>
        m.moduleId === moduleId
          ? {
              ...m,
              lessons: m.lessons.map((l) => (l.lessonId === lesson.lessonId ? { ...l, ...changes } : l)),
            }
          : m
      )
    );
  }, [moduleId, lesson.lessonId, setModules]);

  const removeLesson = (moduleId: string, lessonId: string) =>
    setModules((prev) =>
      prev.map((m) => (m.moduleId === moduleId ? { ...m, lessons: m.lessons.filter((l) => l.lessonId !== lessonId) } : m))
    );

  const showVideoPrev = async (file: File) => {
    const url = URL.createObjectURL(file);
    setPrevURL(url);
    setVideoFile(file);
    const duration = await getVideoDuration(file);
    setDuration(duration)
  };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("video/")) {
        showVideoPrev(file);
      } else {
        setErrors(prev=>({...prev,video:{success:false,message:"Please upload a valid video file"}}));
      }
    }
  };

  const handleUpload = async () => {

    try{
    const validationErrors = validateLesson({
      file: videoFile!,
      title: lesson.title,
      description: lesson.description,
      resources: watchedResources,
    });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0 && videoFile) {
      setUploadStared(true)
      const { signedUrl } = await getPresignedUrl(videoFile!);
      await uploadFile(signedUrl, videoFile, setUploadProgress);
     const response = await createLesson({
        lessonId: lesson.lessonId,
        moduleId,
        title,
        description: lesson.description,
        fileName: videoFile.name,
        duration ,
        contentType: "video",
        resources: watchedResources,
        order,
      });
      queryClient.invalidateQueries({ queryKey: ["modulesAndLesson"] });
      toast.success(response.message)
    }
  }   catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    toast.error(message);
    throw message;
  }
  };
  React.useEffect(() => {
    setPrevURL(prevURL || lesson.signedVideoUrl || null);
    prevURLRef.current = lesson.signedVideoUrl || null;
    return () => {
      if (prevURLRef.current) URL.revokeObjectURL(prevURLRef.current);
    };
  }, [lesson.signedVideoUrl]);

  React.useEffect(() => {
    if (JSON.stringify(lesson.resources) !== JSON.stringify(watchedResources)) {
      updateLesson({ resources: watchedResources as readonly string[] });
    }
  }, [watchedResources, lesson.resources, updateLesson]);

  return (
    <div className="space-y-4 mb-3 rounded-2xl  bg-gray-200  dark:bg-gray-800 shadow-2xl p-4">
      <div className="flex-col space-y-4">
        <p className="text-right font-semibold mb-2">Lession No : {order}</p>
        {/* {!editLesson && <button onClick={()=>setEditLesson(false)} className="text-2xl block ml-auto cursor-pointer">&#128393;</button>} */}
       <div
      className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center transition
      ${isDragging ? "border-indigo-500 bg-indigo-50" : "border-gray-300"}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => {
        setIsDragging(false) 
        setErrors(prev=>({...prev,video:{success:true,message:""}}))}}
      onDrop={handleDrop}
    >
          {prevURL ? (
            <video src={prevURL??lesson.signedVideoUrl} controls className="rounded-lg w-64 h-40 object-cover mb-3" />
          ) : (
            <p className="text-gray-400">No video selected</p>
          )}
         { !uploadStared && /^\d{13,}$/.test(lesson.lessonId)  && <div className="flex gap-3 mt-2">
            <label className="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
              {prevURL ? "Change" : "Select Video"}
              <input
                type="file"
                accept="video/*"
                // accept="video/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) showVideoPrev(e.target.files[0]);
                }}
              />
            </label>
            {prevURL && (
              <button
                onClick={() => {
                  setPrevURL("");
                  setVideoFile(null);
                }}
                className="cursor-pointer border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                Remove
              </button>
            )}
          </div>}
          <ErrorMessage error={errors.video?.message} />
        </div>
        <div className=" mx-auto">
          <label htmlFor="lesson_title" className="block m-2">
            Lesson Title
          </label>
          <TextInput
            id="lesson_title"
            placeholder="Lesson Title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              updateLesson({ title: e.target.value });
            }}
            className="bg-gray-300"
          />
          <ErrorMessage error={errors.title?.message} />
        </div>
        <label htmlFor="lesson_description" className="block m-2">
          Lesson Description
        </label>
        <textarea
          id="lesson_description"
          rows={2}
          placeholder="Lesson Description"
          className="w-full border mt-1 border-gray-400 dark:bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          value={lesson.description}
          onChange={(e) => updateLesson({ description: e.target.value })}
        />
        <ErrorMessage error={errors.description?.message} />
        <label htmlFor="" className="block m-2">
          Resources / Reference (Optional)
        </label>
        <DynamicField
          control={control}
          name="resources"
          placeholder="resource link"
        />
        <ErrorMessage error={errors.resources?.message} />
        {!uploadStared &&<div className="flex justify-between items-center ">
          <button
            type="button"
            onClick={() => removeLesson(moduleId, lesson.lessonId)}
            className="cursor-pointer border border-gray-400 p-2 rounded-lg my-4 "
          >
            Delete🗑️
          </button>
         {/^\d{13,}$/.test(lesson.lessonId)&&<button onClick={handleUpload} className="cursor-pointer border p-2 rounded-lg my-4">
            Upload&#129093;
          </button>}
        </div>}
      </div>
      {uploadProgress>0 && <UploadProgressBar progress={uploadProgress} />}
    </div>
  );
}
