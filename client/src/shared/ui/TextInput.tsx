
import { forwardRef } from "react"

type TextInputProps = {
    type:string
    id:string;
    placeholder: string;
    value: string;
    showPassword?:boolean
    setValue: (value: string) => void;
    icon?: () => React.ReactNode;
}

const TextInput = ({type,id,value,placeholder,setValue,showPassword,icon}:TextInputProps) => {
  return (
    <div>
         <div className="relative flex items-center">
              <input
                  type={showPassword ? 'text' : type}
                  id={id}
                  placeholder={placeholder}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  // required
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

export default TextInput

