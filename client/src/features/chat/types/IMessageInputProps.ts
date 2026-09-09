export interface EmojiData {
  native: string;
}

export interface MessageInputProps {
  onSendMessage: (content: string, file?: File) => Promise<void>;
  onTyping: (isTyping: boolean) => void;
  disabled?: boolean;
  isUploading?: boolean;
  uploadProgress?: number;
}
