import React, { useState, useEffect } from 'react'
import { useDebounce } from "../hooks/useDebounce"

type DebouncedInput = {
    id:string;
    type:string
    placeholder: string;
    value: string;
    showPassword?:boolean
    setValue: (value: string) => void;
    icon?: () => React.ReactNode;
}

const DebouncedInput = ({id,type,placeholder,value,setValue,showPassword,icon}:DebouncedInput)=> {
    const [inputValue, setInputValue] = useState(value);
    const debouncedValue = useDebounce(inputValue, 500);

    useEffect(() => {
        setValue(debouncedValue);
    }, [debouncedValue, setValue]);

    return (
      <div>
           <div className="relative flex items-center">
                <input
                    id={id}
                    type={showPassword ? 'text' : type}
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className=" w-full mt-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                    autoComplete='new-password'
                />
                {icon && (
                    <span className="absolute right-3">
                        {icon()}
                    </span>
                )}
            </div>
      </div>
    )
}

export default DebouncedInput

