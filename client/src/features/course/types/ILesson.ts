export interface LessonType {
  lessonId:string
  moduleId:string
  title: string;
  description:string;
  contentType:string
  fileName?: string;
  signedVideoUrl?: string;
  duration:number|null
  order:number
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
