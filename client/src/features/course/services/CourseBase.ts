import api from "@shared/utils/AxiosInstance";
import type { Ibase } from "../types/IBase";

export const createBase = async (data: Ibase) => {
  const response = await api.post("/course/createbase", data);
  return response.data;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateBase = async (courseId: string, data: any) => {
  const response = await api.patch(`/course/${courseId}`, data);
  return response.data;
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

export const deleteCourse = async (courseId: string) => {
  const response = await api.delete(`/course/${courseId}`);
  return response.data;
};
