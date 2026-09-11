import { ContentType } from "@shared/enums/ContentType";

export interface LessonType {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  contentType: ContentType;
  fileName?: string | undefined;
  signedVideoUrl?: string | undefined;
  duration: number | null;
  order: number;
  resources: readonly string[];
  isFreePreview?: boolean | undefined;
  isBlocked?: boolean | undefined;
}

// export interface uploadToB2Props {
//     uploadUrl:string;
//     uploadAuthToken:string;
//     file:File
//     setVideoURL: (url: string) => void;
//     setUploadProgress:(percent: number) => void;
// }
