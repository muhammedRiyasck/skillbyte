import React, { useState, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';

type DebouncedInput = {
  id: string;
  type: string;
  placeholder: string;
  value: string;
  showPassword?: boolean;
  setValue: (value: string) => void;
  icon?: () => React.ReactNode;
  className?: string;
};

const DebouncedInput = ({
  id,
  type,
  placeholder,
  value,
  setValue,
  showPassword,
  icon,
  className,
}: DebouncedInput) => {
  const [inputValue, setInputValue] = useState(value);
  const debouncedValue = useDebounce(inputValue, 500);

  const isFirstRender = React.useRef(true);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setValue(debouncedValue);
  }, [debouncedValue, setValue]);

  return (
    <div className="w-full">
      <div className="relative flex items-center">
        {/* Optional left icon */}
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            {icon()}
          </span>
        )}

        <input
          id={id}
          type={showPassword ? 'text' : type}
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          autoComplete="new-password"
          className={`
            w-full
            h-11
            rounded-xl
            border border-gray-200 dark:border-gray-800
            bg-white dark:bg-[#0b1220]
            px-4
            ${icon ? 'pl-10' : ''}
            text-sm
            text-gray-900 dark:text-gray-100
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            outline-none
            shadow-sm
            transition-all duration-200
            hover:border-gray-300 dark:hover:border-gray-700
            focus:border-blue-500
            focus:ring-4 focus:ring-blue-500/10
            ${className || ''}
          `}
        />
      </div>
    </div>
  );
};

export default DebouncedInput;