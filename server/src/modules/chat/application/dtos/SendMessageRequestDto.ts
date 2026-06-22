export interface SendMessageRequestDto {
  content?: string;
  type: 'text' | 'image' | 'document';
  fileUrl?: string;
  fileName?: string;
}
