import { useDebounce } from "../hooks/useDebounce"

type TextInputProps = {
    id:string;
    type:string
    placeholder: string;
    value: string;
    showPassword?:boolean
    setValue: (value: string) => void;
    icon?: () => React.ReactNode;
}

const TextInput = ({id,type,placeholder,value,setValue,showPassword,icon}:TextInputProps) => {
  return (
    <div>
         <div className="relative flex items-center">
              <input
                  id={id}
                  type={showPassword ? 'text' : type}
                  placeholder={placeholder}
                  value={value}
                  onChange={(e) => setValue(useDebounce(e.target.value,300))}
                  //   className="w-full border-gray-300 rounded-lg py-2 px-4  focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:bg-gray-700 dark:text-white"
                  // required
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

export default TextInput

