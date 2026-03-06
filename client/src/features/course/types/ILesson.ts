import { ContentType } from "@shared/enums/ContentType";

export interface LessonType {
  id: string
  moduleId: string
  title: string;
  description: string;
  contentType: ContentType
  fileName?: string;
  signedVideoUrl?: string;
  duration: number | null
  order: number
  resources: readonly string[];
  isFreePreview?: boolean;
  isBlocked?: boolean;
}

// export interface uploadToB2Props {
//     uploadUrl:string;
//     uploadAuthToken:string;
//     file:File
//     setVideoURL: (url: string) => void;
//     setUploadProgress:(percent: number) => void;
// }
