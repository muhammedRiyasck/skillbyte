import api from "@shared/utils/AxiosInstance";
// import type { uploadToB2Props } from "../types/ILesson";
import axios from "axios";
import type { LessonType } from "../types/ILesson";

export const getPresignedUrl = async (file: File): Promise<Record<string, string>> => {

  const response = await api.post("/course/presign", { fileName: file.name });
  const { signedUrl, publicUrl } = response.data.data;
  return { signedUrl, publicUrl };

};

export const uploadFile = async (presignUrl: string, file: File, setProgress: (pct: number) => void): Promise<void> => {

  await axios.put(presignUrl, file, {
    headers: { "Content-Type": file.type },
    onUploadProgress: (e) => {
      const pct = e.total ? Math.round((e.loaded * 100) / e.total) : 0;
      setProgress(pct);
    },
  });

};

export const createLesson = async (data: LessonType): Promise<{ message: string }> => {

  const response = await api.post("/course/createlesson", data);
  return response.data;

};

export const updateLesson = async (data: { id: string, title?: string, description?: string, resources?: string[] }) => {
  const { id, ...updateData } = data;
  const response = await api.patch(`/course/lesson/${id}`, updateData);
  return response.data;
};

export const deleteLesson = async (id: string) => {
  const response = await api.delete(`/course/lesson/${id}`);
  return response.data;
};

export const blockLesson = async (id: string, isBlocked: boolean) => {
  const response = await api.patch(`/course/lesson/${id}/block`, { isBlocked });
  return response.data;
};

