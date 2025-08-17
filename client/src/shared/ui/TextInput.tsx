

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
                //   className="w-full border-gray-300 rounded-lg py-2 px-4  focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:bg-gray-700 dark:text-white"
                  // required
                className=" w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 dark:text-white"

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

