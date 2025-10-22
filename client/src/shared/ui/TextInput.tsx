
import React, { forwardRef, memo } from 'react';
import { cn } from '../utils/cn';

interface TextInputProps {
  id: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  showPassword?: boolean;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  label?: string;
  helperText?: string;
  icon?: React.ReactNode;
  className?: string;
  autoComplete?: string;
  'data-testid'?: string;
}

const TextInput = memo(forwardRef<HTMLInputElement, TextInputProps>(({
  id,
  type,
  placeholder,
  value,
  onChange,
  showPassword = false,
  disabled = false,
  required = false,
  error,
  label,
  helperText,
  icon,
  className,
  autoComplete = 'off',
  'data-testid': testId,
  ...props
}, ref) => {
  const inputType = type === 'password' && showPassword ? 'text' : type;
  const hasError = !!error;

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          data-testid={testId}
          className={cn(
            "w-full px-4 py-2 border rounded-lg shadow-sm transition-colors",
            "focus:ring-2 focus:ring-indigo-500 focus:outline-none",
            "disabled:bg-gray-100 disabled:cursor-not-allowed disabled:dark:bg-gray-600",
            "dark:bg-gray-700 dark:text-white dark:border-gray-600",
            hasError
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-indigo-500",
            className
          )}
          {...props}
        />
        
        {icon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {icon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
}));

TextInput.displayName = 'TextInput';

export default TextInput;

