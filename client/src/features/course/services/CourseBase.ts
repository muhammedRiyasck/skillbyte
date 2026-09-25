import api from "@shared/utils/AxiosInstance";
import type { Ibase } from "../types/IBase";

export type CreateCoursePayload = Omit<Ibase, "id" | "thumbnailUrl" | "status">;

export const createBase = async (data: CreateCoursePayload) => {
  const response = await api.post("/course/createbase", data);
  return response.data;
};

export const updateBase = async (id: string, data: Partial<Ibase>) => {
  const response = await api.patch(`/course/${id}`, data);
  return response.data;
};

export const uploadThumbnail = async ({ id, blob, fileName }: {
  id: string;
  blob: Blob;
  fileName: string;
}) => {
  const photo = new FormData();
  photo.append("thumbnail", blob, fileName);
  const { data } = await api.post(`/course/upload-thumbnail/${id}`, photo);
  return data;
};

export const deleteCourse = async (id: string) => {
  const response = await api.delete(`/course/${id}`);
  return response.data;
};
