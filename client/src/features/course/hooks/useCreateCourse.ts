import { useQueryClient } from "@tanstack/react-query";
import { createBase, uploadThumbnail } from "../services/CourseBase";

export default function useCreateCourse() {
  const queryClient = useQueryClient();

  return async ({
    formData,
    croppedBlob,
    thumbnailFile,
  }: {
    formData: any;
    croppedBlob: Blob;
    thumbnailFile: File;
  }) => {
    const response = await createBase({ ...formData, thumbnail: null });
     await uploadThumbnail({
      courseId: response.data.courseId,
      blob: croppedBlob,
      fileName: thumbnailFile.name,
    });
    queryClient.invalidateQueries({ queryKey: ["courses"] });
    return response.data.courseId;
  };
}
