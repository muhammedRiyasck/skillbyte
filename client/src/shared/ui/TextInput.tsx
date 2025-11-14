
import React, { forwardRef, memo } from 'react';
import { cn } from '../utils/cn';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showPassword?: boolean;
  label?: string;
  helperText?: string;
  icon?: React.ReactNode;
  className?: string;
  'data-testid'?: string;
}

const TextInputComponent = memo(forwardRef<HTMLInputElement, TextInputProps>(({
  showPassword = false,
  label,
  helperText,
  icon,
  className,
  'data-testid': testId,
  type,
  ...props
}, ref) => {
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={props.id}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          ref={ref}
          type={inputType}
          data-testid={testId}
          className={cn(
            "w-full px-4 py-2 border rounded-lg shadow-sm transition-colors",
            "focus:ring-2 focus:ring-indigo-500 focus:outline-none",
            "disabled:bg-gray-100 disabled:cursor-not-allowed disabled:dark:bg-gray-600",
            "dark:bg-gray-700 dark:text-white dark:border-gray-600",
             "border-gray-300 focus:border-indigo-500",
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

    

      {helperText && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
}));

TextInputComponent.displayName = 'TextInput';

export default TextInputComponent;

