import { useQueryClient } from "@tanstack/react-query";
import { createBase, uploadThumbnail } from "../services/CourseBase";
import type { Ibase } from "../types/IBase";

export default function useCreateCourse() {
  const queryClient = useQueryClient();

  return async ({
    formData,
    croppedBlob,
    thumbnailFile,
  }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formData: any;
    croppedBlob: Blob;
    thumbnailFile: File;
  }) => {
    const response = await createBase({ ...formData, thumbnail: null } as Ibase);
     await uploadThumbnail({
      courseId: response.data.courseId,
      blob: croppedBlob,
      fileName: thumbnailFile.name,
    });
    queryClient.invalidateQueries({ queryKey: ["courses"] });
    return response.data.courseId;
  };
}
