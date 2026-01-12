import React from 'react';
import { format } from 'date-fns';
import { FileText, Download, Check, CheckCheck } from 'lucide-react';
import type { MessageBubbleProps } from '../types/IMessageBubbleProps';



const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage }) => {
  const isImage = message.type === 'image';
  const isDocument = message.type === 'document';

  return (
    <div className={`flex w-full mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] sm:max-w-[60%] rounded-lg shadow-sm relative ${
          isOwnMessage
            ? 'bg-indigo-600 text-white rounded-br-none'
            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-200 dark:border-gray-700'
        }`}
      >
        {isImage && message.fileUrl && (
          <div className="p-2 pb-0">
            <img
              src={message.fileUrl}
              alt="Shared image"
              className="rounded-lg max-h-60 w-full object-cover cursor-pointer"
              onClick={() => window.open(message.fileUrl, '_blank')}
            />
          </div>
        )}

        {isDocument && message.fileUrl && (
          <div className="p-3 pb-0">
            <a
              href={message.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isOwnMessage
                  ? 'bg-indigo-700 hover:bg-indigo-800'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <FileText className="w-8 h-8" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{message.fileName || 'Document'}</p>
                <p className="text-xs opacity-70">Click to open</p>
              </div>
              <Download className="w-5 h-5 opacity-70" />
            </a>
          </div>
        )}

        <div className={`px-4 py-2 ${isImage || isDocument ? 'pt-2' : ''}`}>
          {message.content && (
             <p className={`text-sm md:text-base whitespace-pre-wrap break-words ${isOwnMessage ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}>
               {message.content}
             </p>
          )}
          
          <div className={`flex items-center justify-end gap-1 mt-1 ${isOwnMessage ? 'text-indigo-200' : 'text-gray-400'}`}>
            <span className="text-[10px] sm:text-xs">
              {format(new Date(message.createdAt), 'h:mm a')}
            </span>
            {isOwnMessage && (
              <span>
                {message.isRead ? (
                  <CheckCheck className="w-3 h-3 sm:w-4 sm:h-4 text-blue-300" />
                ) : (
                  <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
