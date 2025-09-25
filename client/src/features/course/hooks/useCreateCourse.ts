import { useQueryClient } from "@tanstack/react-query";
import { createBase, uploadThumbnail } from "../services/CreateBase";

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
    const success = await uploadThumbnail({
      courseId: response.course.id,
      blob: croppedBlob,
      fileName: thumbnailFile.name,
    });
    queryClient.invalidateQueries({ queryKey: ["courses"] });
    return success;
  };
}
