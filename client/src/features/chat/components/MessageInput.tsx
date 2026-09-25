import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Paperclip, X, FileText, Image as ImageIcon, Loader2, Smile } from 'lucide-react';
import { toast } from 'sonner';
import EmojiPicker from "emoji-picker-react";
import type { MessageInputProps } from '../types/IMessageInputProps';

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTyping,
  disabled,
  isUploading = false,
  uploadProgress = 0,
}) => {
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!showEmojiPicker) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowEmojiPicker(false);
        inputRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showEmojiPicker]);

  const insertEmojiAtCursor = useCallback((emoji: string) => {
  const textarea = inputRef.current;

  if (!textarea) {
    setContent((prev) => prev + emoji);
    return;
  }

  const start = textarea.selectionStart ?? content.length;
  const end = textarea.selectionEnd ?? content.length;

  const newContent =
    content.substring(0, start) +
    emoji +
    content.substring(end);

  setContent(newContent);

  requestAnimationFrame(() => {
    const newCursor = start + emoji.length;

    textarea.selectionStart = newCursor;
    textarea.selectionEnd = newCursor;
    textarea.focus();
  });
}, [content]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    onTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => onTyping(false), 2000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      inputRef.current?.focus();
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    inputRef.current?.focus();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!content.trim() && !selectedFile) || isSending || disabled || isUploading) return;

    setIsSending(true);
    setShowEmojiPicker(false);
    try {
      await onSendMessage(content, selectedFile || undefined);
      setContent('');
      clearFile();
      onTyping(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isBusy = isSending || isUploading || !!disabled;

  return (
    <div className="p-3 sm:p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 w-full flex-none">

      {/* File preview */}
      {selectedFile && (
        <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-between border border-gray-200 dark:border-gray-700 gap-2">
          <div className="flex items-center gap-3 overflow-hidden min-w-0">
            <div className="p-2 bg-indigo-100 cursor-pointer dark:bg-indigo-900 rounded-lg text-indigo-600 dark:text-indigo-400 shrink-0">
              {selectedFile.type.startsWith('image/') ? (
                <ImageIcon size={18} />
              ) : (
                <FileText size={18} />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-400">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          {!isUploading && (
            <button
              onClick={clearFile}
              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 shrink-0"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {/* Upload progress bar */}
      {isUploading && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1.5">
              <Loader2 size={12} className="animate-spin" />
              Uploading...
            </span>
            <span className="text-xs text-gray-500">{uploadProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-end gap-1.5 sm:gap-2">
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx"        />

        {/* Attach file button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isBusy}
          className="p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors disabled:opacity-40 shrink-0 cursor-pointer"
          title="Attach file"
          type="button"
        >
          <Paperclip size={20} />
        </button>

        {/* Emoji picker wrapper */}
        <div className="relative shrink-0 " ref={emojiPickerRef}>
          <button
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            disabled={isBusy}
            className={`p-2.5 rounded-full transition-colors disabled:opacity-40 cursor-pointer ${
              showEmojiPicker
                ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/40'
                : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            title="Emoji"
            type="button"
          >
            <Smile size={20} />
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-12 left-0 z-50 shadow-2xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <EmojiPicker
  onEmojiClick={(emojiData) => insertEmojiAtCursor(emojiData.emoji)}
  previewConfig={{ showPreview: false }}
  skinTonesDisabled
  width={320}
  height={350}
/>
            </div>
          )}
        </div>

        {/* Textarea */}
        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl border border-transparent transition-all focus-within:border-indigo-300 dark:focus-within:border-indigo-600">
          <textarea
            ref={inputRef}
            autoFocus
            value={content}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={isBusy}
            style={{ scrollbarWidth: 'none', overflowY: 'auto', minHeight: '44px' }}
            className="w-full max-h-32 px-4 py-3 bg-transparent outline-none resize-none text-gray-900 dark:text-gray-100 placeholder-gray-400 text-sm leading-relaxed"
            rows={1}
          />
        </div>

        {/* Send button */}
        <button
          onClick={() => handleSubmit()}
          disabled={(!content.trim() && !selectedFile) || isBusy}
          className="p-3 cursor-pointer bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-full shadow-md transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
          type="button"
        >
          {isSending || isUploading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Send size={20} />
          )}
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
