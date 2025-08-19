export interface LessonInput {
  title: string;
  contentType: "video" | "pdf";
  contentUrl: string;
  order: number;
  isFreePreview?: boolean;
  isPublished?: boolean;
}
