import { toast } from "sonner";
import api from "@shared/utils/AxiosInstance";
import type { Ibase } from "../types/IBase";

export const createBase = async (data: Ibase) => {
  try {
    const response = await api.post("/course/createbase", data);
    return response.data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    toast.error(message);
    throw new Error(message);
  }
};

export const updateBase = async (courseId: string, data: any) => {
  try {
    const response = await api.patch(`/course/${courseId}`, data);
    return response.data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    toast.error(message);
    throw new Error(message);
  }
};

export const uploadThumbnail = async ({courseId,blob,fileName}: {
  courseId: string;
  blob: Blob;
  fileName: string;
}) => {
  const photo = new FormData();
  photo.append("thumbnail", blob, fileName);
  const { data } = await api.post(`/course/upload-thumbnail/${courseId}`, photo);
  return data;
};
