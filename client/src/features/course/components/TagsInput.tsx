import React, { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const TagsInput: React.FC<TagsInputProps> = ({
  value = [],
  onChange,
  placeholder = "Add tags...",
  className = "",
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState('');

  const addTag = (tag: string) => {
    if (disabled) return;
    const trimmedTag = tag.trim();
    if (trimmedTag && !value.includes(trimmedTag)) {
      onChange([...value, trimmedTag]);
    }
    setInputValue('');
  };

  const removeTag = (tagToRemove: string) => {
    if (disabled) return;
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    setInputValue(e.target.value);
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-lg focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 dark:bg-gray-700 dark:border-gray-600">
        {value.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm dark:bg-indigo-900 dark:text-indigo-200"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:bg-indigo-200 rounded-full p-0.5 dark:hover:bg-indigo-800 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-0 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          disabled={disabled}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
        Press Enter, comma, or space to add a tag
      </p>
    </div>
  );
};

export default TagsInput;
