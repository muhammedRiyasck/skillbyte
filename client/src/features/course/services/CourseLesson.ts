import api from "@shared/utils/AxiosInstance";
// import type { uploadToB2Props } from "../types/ILesson";
import axios from "axios";
import type { LessonType } from "../types/ILesson";

export const getPresignedUrl = async (file: File): Promise<Record<string, string>> => {
 
    const response = await api.post("/course/presign", { fileName: file.name });
    console.log(response.data)
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

export const createLesson = async (data: LessonType): Promise<{message:string}> => {
  
    const response = await api.post("/course/createlesson", data);
    return response.data;

};

// export async function uploadToB2({ uploadUrl, uploadAuthToken, file, setVideoURL, setUploadProgress }: uploadToB2Props) {
//     try {
//          const response = await api.post(uploadUrl, file, {
//     headers: {
//       Authorization: uploadAuthToken,
//       "X-Bz-File-Name": encodeURIComponent(file.name),
//       "Content-Type": "b2/x-auto",
//     },
//     onUploadProgress: (progressEvent) => {
//       const percent = progressEvent.total ? Math.round((progressEvent.loaded * 100) / progressEvent.total) : 0;
//       setUploadProgress(percent);
//     },
//   });
//   setVideoURL(response.data.fileUrl);
//   setUploadProgress(0);
//     } catch (error:any) {
//         toast.error(error.message)
//         throw error.message
//     }
// }
