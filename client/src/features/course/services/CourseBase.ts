import api from "@shared/utils/AxiosInstance";
import type { Ibase } from "../types/IBase";

export const createBase = async (data: Ibase) => {
  const response = await api.post("/course/createbase", data);
  return response.data;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateBase = async (id: string, data: any) => {
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
