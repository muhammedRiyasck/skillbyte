import { useQueryClient } from "@tanstack/react-query";
import { createBase, uploadThumbnail } from "../services/CourseBase";
import type { CreateCoursePayload } from "../services/CourseBase";

export default function useCreateCourse() {
  const queryClient = useQueryClient();

  return async ({
    formData,
    croppedBlob,
    thumbnailFile,
  }: {
    formData: CreateCoursePayload;
    croppedBlob: Blob;
    thumbnailFile: File;
  }) => {
    const response = await createBase(formData);
    await uploadThumbnail({
      id: response.data.id,
      blob: croppedBlob,
      fileName: thumbnailFile.name,
    });
    queryClient.invalidateQueries({ queryKey: ["courses"] });
    return response.data.id;
  };
}
